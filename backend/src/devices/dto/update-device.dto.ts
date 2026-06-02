import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateDeviceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsUUID()
  @IsOptional()
  ownerId?: string;
}
