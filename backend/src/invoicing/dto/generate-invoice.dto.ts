import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class GenerateInvoiceDto {
  @IsString()
  fleetAccountId: string;

  @IsDateString()
  periodStartDate: Date;

  @IsDateString()
  periodEndDate: Date;

  @IsOptional()
  @IsNumber()
  paymentTermsDays?: number; // Defaults to fleet account payment terms

  @IsOptional()
  @IsString()
  notes?: string;
}
