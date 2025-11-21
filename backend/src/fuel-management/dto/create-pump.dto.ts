import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PumpStatus } from '../../schemas/fuel-pump.schema';

export class PumpNozzleDto {
  @IsString()
  nozzleNumber: string;

  @IsString()
  fuelType: string;

  @IsOptional()
  @IsString()
  tankId?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreatePumpDto {
  @IsString()
  locationId: string;

  @IsString()
  pumpNumber: string;

  @IsOptional()
  @IsEnum(PumpStatus)
  status?: PumpStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PumpNozzleDto)
  nozzles?: PumpNozzleDto[];

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsDateString()
  installationDate?: Date;

  @IsOptional()
  @IsBoolean()
  hasCardReader?: boolean;

  @IsOptional()
  @IsBoolean()
  hasContactless?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPrinter?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
