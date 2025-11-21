import { IsString, IsDateString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BreakPeriodDto {
  @IsDateString()
  start: Date;

  @IsOptional()
  @IsDateString()
  end?: Date;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  paid?: boolean;
}

export class CreateTimeEntryDto {
  @IsString()
  employeeId: string;

  @IsString()
  locationId: string;

  @IsDateString()
  clockIn: Date;

  @IsOptional()
  @IsDateString()
  clockOut?: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakPeriodDto)
  breaks?: BreakPeriodDto[];

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
