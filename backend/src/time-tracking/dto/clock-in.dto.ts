import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ClockInDto {
  @IsString()
  locationId: string;

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsString()
  clockInMethod?: string; // 'pos', 'web', 'mobile', 'biometric'

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
