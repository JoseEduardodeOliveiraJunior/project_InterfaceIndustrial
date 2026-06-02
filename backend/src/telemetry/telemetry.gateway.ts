import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/telemetry',
})
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TelemetryGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emits telemetry data to all connected frontend clients
   */
  broadcastTelemetry(deviceId: string, data: Record<string, unknown>) {
    this.server.emit('telemetry:update', { deviceId, ...data });
  }

  /**
   * Emits device status change to all connected frontend clients
   */
  broadcastDeviceStatus(deviceId: string, status: string) {
    this.server.emit('device:status', { deviceId, status });
  }
}
