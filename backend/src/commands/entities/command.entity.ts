import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from '../../devices/entities/device.entity';

@Entity('commands')
export class Command {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'device_id' })
  deviceId!: string;

  @ManyToOne(() => Device, (device) => device.commands, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device!: Device;

  @Column({ name: 'command_type', length: 30 })
  commandType!: string;

  @Column({ type: 'jsonb', nullable: true })
  payload!: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 15, default: 'pending' })
  status!: 'pending' | 'executed' | 'failed';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'executed_at', type: 'timestamp', nullable: true })
  executedAt!: Date | null;
}
