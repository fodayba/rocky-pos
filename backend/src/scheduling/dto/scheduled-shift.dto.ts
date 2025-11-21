import { IsString, IsDateString, IsEnum, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { ShiftType } from '../../schemas/schedule.schema';

export class ScheduledShiftDto {
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  employeeName?: string;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsOptional()
  @IsEnum(ShiftType)
  shiftType?: ShiftType;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  breakDuration?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  callOff?: boolean;

  @IsOptional()
  @IsString()
  callOffReason?: string;

  @IsOptional()
  @IsString()
  replacementEmployeeId?: string;
}
