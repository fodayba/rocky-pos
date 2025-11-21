import { IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class TankReadingDto {
  @IsNumber()
  @Min(0)
  currentLevel: number;

  @IsOptional()
  @IsNumber()
  currentTemperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  waterLevel?: number;

  @IsOptional()
  @IsBoolean()
  waterDetected?: boolean;

  @IsOptional()
  @IsBoolean()
  leakDetected?: boolean;

  @IsOptional()
  @IsNumber()
  ullage?: number;
}
