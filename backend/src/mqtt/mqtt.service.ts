import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { TelemetryService } from '../telemetry/telemetry.service';
import { TelemetryGateway } from '../telemetry/telemetry.gateway';
import { DevicesService } from '../devices/devices.service';

type IncomingTelemetryPayload = {
  deviceId?: string;
  deviceKey?: string;
  machineName?: string;
  sector?: string;
  consumptionKwh?: number;
  voltage?: number;
  current?: number;
  status?: string;
  timestamp?: string;
  temperature?: number;
  speed?: number;
  pressure?: number;
  espStatus?: boolean;
  lockStatus?: boolean;
};

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client!: mqtt.MqttClient;
  private readonly logger = new Logger(MqttService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly telemetryService: TelemetryService,
    private readonly telemetryGateway: TelemetryGateway,
    private readonly devicesService: DevicesService,
  ) {}

  onModuleInit() {
    const url = this.configService.get<string>(
      'MQTT_URL',
      'mqtt://localhost:1883',
    );
    this.client = mqtt.connect(url);

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      this.client.subscribe('devices/+/telemetry', (err) => {
        if (err) this.logger.error('Failed to subscribe to telemetry', err);
      });
      this.client.subscribe('industrial/energy/telemetry', (err) => {
        if (err)
          this.logger.error(
            'Failed to subscribe to industrial energy telemetry',
            err,
          );
      });
      this.client.subscribe('industrial/machines/+/energy', (err) => {
        if (err)
          this.logger.error(
            'Failed to subscribe to machine energy telemetry',
            err,
          );
      });
      this.client.subscribe('devices/+/command/ack', (err) => {
        if (err) this.logger.error('Failed to subscribe to command acks', err);
      });
    });

    this.client.on('message', (topic: string, message: Buffer) => {
      this.handleMessage(topic, message).catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(
            `Error handling MQTT message: ${err.message}`,
            err.stack,
          );
        } else {
          this.logger.error('Error handling MQTT message', err as string);
        }
      });
    });

    this.client.on('error', (err) => {
      this.logger.error('MQTT connection error', err);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
    }
  }

  private async handleMessage(topic: string, message: Buffer) {
    const payload = this.parsePayload(message);
    if (!payload) {
      return;
    }

    const deviceKey = this.extractDeviceKey(topic, payload);
    if (!deviceKey) {
      this.logger.warn(
        `Unable to determine device key from topic or payload: ${topic}`,
      );
      return;
    }

    const device = await this.devicesService.findByDeviceKey(deviceKey);
    if (!device) {
      this.logger.warn(`Unknown device key: ${deviceKey}`);
      return;
    }

    const telemetryPayload = {
      deviceId: device.id,
      machineName: payload.machineName ?? device.name,
      sector: payload.sector ?? null,
      consumptionKwh: payload.consumptionKwh ?? null,
      voltage: payload.voltage ?? null,
      current: payload.current ?? null,
      status: payload.status as 'NORMAL' | 'ATENCAO' | 'CRITICO' | undefined,
      temperature: payload.temperature ?? null,
      speed: payload.speed ?? null,
      pressure: payload.pressure ?? null,
      espStatus: payload.espStatus ?? false,
      lockStatus: payload.lockStatus ?? true,
      recordedAt: payload.timestamp ? new Date(payload.timestamp) : undefined,
    };

    const telemetry = await this.telemetryService.create(telemetryPayload);
    await this.devicesService.updateStatus(device.id, 'online');

    if (payload.lockStatus !== undefined || payload.speed !== undefined) {
      await this.devicesService.updateDeviceState(device.id, {
        lockStatus: payload.lockStatus,
        speedValue: payload.speed,
      });
    }

    this.telemetryGateway.broadcastTelemetry(device.id, {
      deviceName: device.name,
      machineName: telemetry.machineName,
      sector: telemetry.sector,
      consumptionKwh: telemetry.consumptionKwh,
      voltage: telemetry.voltage,
      current: telemetry.current,
      status: telemetry.status,
      recordedAt: telemetry.recordedAt,
    });

    this.telemetryGateway.broadcastDeviceStatus(device.id, 'online');
  }

  private parsePayload(message: Buffer): IncomingTelemetryPayload | null {
    try {
      return JSON.parse(message.toString()) as IncomingTelemetryPayload;
    } catch (error) {
      this.logger.error('Failed to parse MQTT payload', error as Error);
      return null;
    }
  }

  private extractDeviceKey(
    topic: string,
    payload: IncomingTelemetryPayload,
  ): string | null {
    const parts = topic.split('/');

    if (parts[0] === 'devices' && parts.length >= 3) {
      return parts[1];
    }

    if (
      parts[0] === 'industrial' &&
      parts[1] === 'machines' &&
      parts[3] === 'energy'
    ) {
      return parts[2];
    }

    if (topic === 'industrial/energy/telemetry') {
      return payload.deviceKey ?? payload.deviceId ?? null;
    }

    return payload.deviceKey ?? payload.deviceId ?? null;
  }

  /**
   * Publish a command to a device via MQTT
   */
  publishCommand(deviceId: string, command: Record<string, unknown>) {
    const topic = `devices/${deviceId}/command`;
    this.client.publish(topic, JSON.stringify(command), { qos: 1 });
    this.logger.log(
      `Command published to ${topic}: ${JSON.stringify(command)}`,
    );
  }
}
