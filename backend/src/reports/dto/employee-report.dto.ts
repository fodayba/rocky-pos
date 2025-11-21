import { IsDateString, IsOptional, IsString } from 'class-validator';

export class EmployeeReportDto {
  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;
}
