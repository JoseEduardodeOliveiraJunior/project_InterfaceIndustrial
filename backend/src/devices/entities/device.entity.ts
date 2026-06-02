import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Telemetry } from '../../telemetry/entities/telemetry.entity';
import { Command } from '../../commands/entities/command.entity';
import { ActionLog } from '../../logs/entities/action-log.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ name: 'device_key', unique: true, length: 64 })
  deviceKey!: string;

  @Column({ length: 30, default: 'ESP32' })
  type!: string;

  @Column({ type: 'varchar', length: 10, default: 'offline' })
  status!: 'online' | 'offline';

  @Column({ name: 'lock_status', default: true })
  lockStatus!: boolean;

  @Column({ name: 'speed_value', type: 'float', default: 0 })
  speedValue!: number;

  @Column({ name: 'owner_id' })
  ownerId!: string;

  @ManyToOne(() => User, (user) => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({ name: 'last_seen_at', type: 'timestamp', nullable: true })
  lastSeenAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Telemetry, (telemetry) => telemetry.device)
  telemetryReadings!: Telemetry[];

  @OneToMany(() => Command, (command) => command.device)
  commands!: Command[];

  @OneToMany(() => ActionLog, (log) => log.device)
  actionLogs!: ActionLog[];
}
