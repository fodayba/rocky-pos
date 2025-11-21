import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';
import { FuelType } from '../../schemas/fuel-product.schema';
import { TankStatus } from '../../schemas/fuel-tank.schema';

export class CreateTankDto {
  @IsString()
  locationId: string;

  @IsString()
  tankNumber: string;

  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsNumber()
  @Min(0)
  capacity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentLevel?: number;

  @IsOptional()
  @IsNumber()
  minLevel?: number;

  @IsOptional()
  @IsNumber()
  maxSafeLevel?: number;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsDateString()
  installationDate?: Date;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  epaId?: string;

  @IsOptional()
  @IsBoolean()
  hasLeakDetection?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCathodicProtection?: boolean;

  @IsOptional()
  @IsEnum(TankStatus)
  status?: TankStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
