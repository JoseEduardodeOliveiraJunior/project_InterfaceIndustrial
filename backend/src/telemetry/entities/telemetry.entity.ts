import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from '../../devices/entities/device.entity';

@Entity('telemetry')
export class Telemetry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'device_id' })
  deviceId!: string;

  @ManyToOne(() => Device, (device) => device.telemetryReadings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device!: Device;

  @Column({ type: 'varchar', length: 100, nullable: true })
  machineName?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sector!: string | null;

  @Column({ name: 'consumption_kwh', type: 'float', nullable: true })
  consumptionKwh!: number | null;

  @Column({ type: 'float', nullable: true })
  voltage!: number | null;

  @Column({ type: 'float', nullable: true })
  current!: number | null;

  @Column({ type: 'varchar', length: 10, default: 'NORMAL' })
  status!: 'NORMAL' | 'ATENCAO' | 'CRITICO';

  @Column({ type: 'float', nullable: true })
  temperature!: number | null;

  @Column({ type: 'float', nullable: true })
  speed!: number | null;

  @Column({ type: 'float', nullable: true })
  pressure!: number | null;

  @Column({ name: 'esp_status', default: false })
  espStatus!: boolean;

  @Column({ name: 'lock_status', default: true })
  lockStatus!: boolean;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt!: Date;
}
