import { IsString, IsDateString, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceLineItemDto {
  @IsDateString()
  date: Date;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsString()
  transactionNumber: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateInvoiceDto {
  @IsString()
  fleetAccountId: string;

  @IsString()
  accountNumber: string;

  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsDateString()
  invoiceDate: Date;

  @IsDateString()
  dueDate: Date;

  @IsDateString()
  periodStartDate: Date;

  @IsDateString()
  periodEndDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems: InvoiceLineItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;
}
