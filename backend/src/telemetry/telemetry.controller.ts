import { Controller, Get, Param, UseGuards, ParseUUIDPipe, Query } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('devices/:deviceId/telemetry')
@UseGuards(JwtAuthGuard)
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get()
  findByDevice(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Query('limit') limit?: string,
  ) {
    return this.telemetryService.findLatestByDevice(
      deviceId,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('latest')
  findLatest(@Param('deviceId', ParseUUIDPipe) deviceId: string) {
    return this.telemetryService.findLatestOne(deviceId);
  }
}
