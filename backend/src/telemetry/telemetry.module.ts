import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { TelemetryGateway } from './telemetry.gateway';
import { Telemetry } from './entities/telemetry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Telemetry])],
  controllers: [TelemetryController],
  providers: [TelemetryService, TelemetryGateway],
  exports: [TelemetryService, TelemetryGateway],
})
export class TelemetryModule {}
