import { Module, forwardRef } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    TelemetryModule,
    forwardRef(() => DevicesModule),
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
