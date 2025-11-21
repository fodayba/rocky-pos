import { IsDateString, IsOptional, IsString } from 'class-validator';

export class SalesReportDto {
  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  groupBy?: string; // 'day', 'week', 'month', 'product', 'category'
}
