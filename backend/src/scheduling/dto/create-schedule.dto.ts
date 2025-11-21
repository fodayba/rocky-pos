import { IsString, IsDateString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduledShiftDto } from './scheduled-shift.dto';

export class CreateScheduleDto {
  @IsString()
  locationId: string;

  @IsDateString()
  weekStartDate: Date;

  @IsDateString()
  weekEndDate: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduledShiftDto)
  shifts?: ScheduledShiftDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
