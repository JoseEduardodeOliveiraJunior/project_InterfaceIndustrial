import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { CommandsModule } from './commands/commands.module';
import { LogsModule } from './logs/logs.module';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'iot_admin'),
        password: configService.get<string>('DB_PASSWORD', 'iot_secret_2024'),
        database: configService.get<string>('DB_NAME', 'iot_platform'),
        autoLoadEntities: true,
        synchronize: true, // Disable in production — use migrations
      }),
    }),
    AuthModule,
    UsersModule,
    DevicesModule,
    TelemetryModule,
    CommandsModule,
    LogsModule,
    MqttModule,
  ],
})
export class AppModule {}
