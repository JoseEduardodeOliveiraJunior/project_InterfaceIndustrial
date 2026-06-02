import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Command } from './entities/command.entity';
import { LogsService } from '../logs/logs.service';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class CommandsService {
  constructor(
    @InjectRepository(Command)
    private readonly commandRepository: Repository<Command>,
    private readonly logsService: LogsService,
    private readonly devicesService: DevicesService,
  ) {}

  async create(data: {
    deviceId: string;
    commandType: string;
    payload?: Record<string, unknown>;
    userId?: string;
  }): Promise<Command> {
    // Validate device exists
    await this.devicesService.findOne(data.deviceId);

    const command = this.commandRepository.create({
      deviceId: data.deviceId,
      commandType: data.commandType,
      payload: data.payload ?? null,
      status: 'pending',
    });
    const saved = await this.commandRepository.save(command);

    // Log the action
    await this.logsService.create({
      userId: data.userId,
      deviceId: data.deviceId,
      action: data.commandType,
      details: data.payload,
    });

    return saved;
  }

  async findPendingByDevice(deviceId: string): Promise<Command[]> {
    return this.commandRepository.find({
      where: { deviceId, status: 'pending' },
      order: { createdAt: 'ASC' },
    });
  }

  async markExecuted(commandId: string): Promise<Command> {
    const command = await this.commandRepository.findOne({
      where: { id: commandId },
    });
    if (!command) {
      throw new NotFoundException('Comando não encontrado');
    }
    command.status = 'executed';
    command.executedAt = new Date();
    return this.commandRepository.save(command);
  }

  async markFailed(commandId: string): Promise<Command> {
    const command = await this.commandRepository.findOne({
      where: { id: commandId },
    });
    if (!command) {
      throw new NotFoundException('Comando não encontrado');
    }
    command.status = 'failed';
    command.executedAt = new Date();
    return this.commandRepository.save(command);
  }
}
