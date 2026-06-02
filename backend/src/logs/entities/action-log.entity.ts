import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Device } from '../../devices/entities/device.entity';

@Entity('action_logs')
export class ActionLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, (user) => user.actionLogs, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column({ name: 'device_id', nullable: true })
  deviceId!: string | null;

  @ManyToOne(() => Device, (device) => device.actionLogs, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'device_id' })
  device!: Device | null;

  @Column({ length: 50 })
  action!: string;

  @Column({ type: 'jsonb', nullable: true })
  details!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
