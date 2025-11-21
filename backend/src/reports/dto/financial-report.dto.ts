import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FinancialReportDto {
  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  reportType?: string; // 'summary', 'detailed', 'profit-loss', 'cash-flow'
}
