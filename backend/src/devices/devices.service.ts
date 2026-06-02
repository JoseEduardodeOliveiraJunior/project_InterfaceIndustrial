import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Device } from './entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const device = this.deviceRepository.create({
      ...createDeviceDto,
      deviceKey: uuidv4().replace(/-/g, ''),
    });
    return this.deviceRepository.save(device);
  }

  async findAll(): Promise<Device[]> {
    return this.deviceRepository.find({
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByOwner(ownerId: string): Promise<Device[]> {
    return this.deviceRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!device) {
      throw new NotFoundException('Dispositivo não encontrado');
    }
    return device;
  }

  async findByDeviceKey(deviceKey: string): Promise<Device | null> {
    return this.deviceRepository.findOne({ where: { deviceKey } });
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(id);
    Object.assign(device, updateDeviceDto);
    return this.deviceRepository.save(device);
  }

  async updateStatus(id: string, status: 'online' | 'offline'): Promise<void> {
    await this.deviceRepository.update(id, {
      status,
      lastSeenAt: status === 'online' ? new Date() : undefined,
    });
  }

  async updateDeviceState(
    id: string,
    state: { lockStatus?: boolean; speedValue?: number },
  ): Promise<void> {
    await this.deviceRepository.update(id, state);
  }

  async remove(id: string): Promise<void> {
    const device = await this.findOne(id);
    await this.deviceRepository.remove(device);
  }
}
