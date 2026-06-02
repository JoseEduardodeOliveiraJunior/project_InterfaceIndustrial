import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsUUID()
  ownerId!: string;
}
