import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telemetry } from './entities/telemetry.entity';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectRepository(Telemetry)
    private readonly telemetryRepository: Repository<Telemetry>,
  ) {}

  private classifyStatus(consumptionKwh: number | null | undefined) {
    if (consumptionKwh === null || consumptionKwh === undefined) {
      return 'NORMAL' as const;
    }
    if (consumptionKwh < 70) {
      return 'NORMAL' as const;
    }
    if (consumptionKwh <= 90) {
      return 'ATENCAO' as const;
    }
    return 'CRITICO' as const;
  }

  async create(data: {
    deviceId: string;
    machineName?: string | null;
    sector?: string | null;
    consumptionKwh?: number | null;
    voltage?: number | null;
    current?: number | null;
    status?: 'NORMAL' | 'ATENCAO' | 'CRITICO' | string;
    temperature?: number | null;
    speed?: number | null;
    pressure?: number | null;
    espStatus?: boolean;
    lockStatus?: boolean;
    recordedAt?: Date;
  }): Promise<Telemetry> {
    const normalizedStatus = data.status ? data.status.toUpperCase() : undefined;
    const consumptionStatus =
      normalizedStatus === 'NORMAL' ||
      normalizedStatus === 'ATENCAO' ||
      normalizedStatus === 'CRITICO'
        ? (normalizedStatus as 'NORMAL' | 'ATENCAO' | 'CRITICO')
        : this.classifyStatus(data.consumptionKwh ?? null);

    const telemetry = this.telemetryRepository.create({
      deviceId: data.deviceId,
      machineName: data.machineName ?? null,
      sector: data.sector ?? null,
      consumptionKwh: data.consumptionKwh ?? null,
      voltage: data.voltage ?? null,
      current: data.current ?? null,
      status: consumptionStatus,
      temperature: data.temperature ?? null,
      speed: data.speed ?? null,
      pressure: data.pressure ?? null,
      espStatus: data.espStatus ?? false,
      lockStatus: data.lockStatus ?? true,
      recordedAt: data.recordedAt,
    });
    return this.telemetryRepository.save(telemetry);
  }

  async findLatestByDevice(deviceId: string, limit = 20): Promise<Telemetry[]> {
    return this.telemetryRepository.find({
      where: { deviceId },
      order: { recordedAt: 'DESC' },
      take: limit,
    });
  }

  async findLatestOne(deviceId: string): Promise<Telemetry | null> {
    return this.telemetryRepository.findOne({
      where: { deviceId },
      order: { recordedAt: 'DESC' },
    });
  }
}
