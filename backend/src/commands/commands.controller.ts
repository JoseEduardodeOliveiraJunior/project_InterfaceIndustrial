import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { CommandsService } from './commands.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MqttService } from '../mqtt/mqtt.service';

@Controller()
export class CommandsController {
  constructor(
    private readonly commandsService: CommandsService,
    private readonly mqttService: MqttService,
  ) {}

  /**
   * User sends a command to a device (e.g., SET_LOCK, SET_SPEED)
   */
  @Post('devices/:deviceId/commands')
  @UseGuards(JwtAuthGuard)
  async createCommand(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Body() body: { commandType: string; payload?: Record<string, unknown> },
    @Request() req: { user: { id: string } },
  ) {
    const command = await this.commandsService.create({
      deviceId,
      commandType: body.commandType,
      payload: body.payload,
      userId: req.user.id,
    });

    // Publish command to MQTT so the ESP receives it immediately
    this.mqttService.publishCommand(deviceId, {
      commandId: command.id,
      commandType: command.commandType,
      payload: command.payload,
    });

    return command;
  }

  /**
   * Mark a command as executed (called by ESP after executing)
   */
  @Patch('commands/:commandId/executed')
  async markExecuted(@Param('commandId', ParseUUIDPipe) commandId: string) {
    return this.commandsService.markExecuted(commandId);
  }

  /**
   * Mark a command as failed
   */
  @Patch('commands/:commandId/failed')
  async markFailed(@Param('commandId', ParseUUIDPipe) commandId: string) {
    return this.commandsService.markFailed(commandId);
  }

  /**
   * Get pending commands for a device (fallback if MQTT missed)
   */
  @Get('devices/:deviceId/commands/pending')
  async getPending(@Param('deviceId', ParseUUIDPipe) deviceId: string) {
    return this.commandsService.findPendingByDevice(deviceId);
  }
}
