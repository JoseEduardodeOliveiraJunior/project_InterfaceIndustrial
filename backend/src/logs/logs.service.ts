import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionLog } from './entities/action-log.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(ActionLog)
    private readonly logRepository: Repository<ActionLog>,
  ) {}

  async create(data: {
    userId?: string | null;
    deviceId?: string | null;
    action: string;
    details?: Record<string, unknown>;
  }): Promise<ActionLog> {
    const log = this.logRepository.create({
      userId: data.userId ?? null,
      deviceId: data.deviceId ?? null,
      action: data.action,
      details: data.details ?? null,
    });
    return this.logRepository.save(log);
  }

  async findAll(limit = 100): Promise<ActionLog[]> {
    return this.logRepository.find({
      relations: ['user', 'device'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByDevice(deviceId: string, limit = 50): Promise<ActionLog[]> {
    return this.logRepository.find({
      where: { deviceId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
