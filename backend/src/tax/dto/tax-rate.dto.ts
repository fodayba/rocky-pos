import { IsEnum, IsNumber, IsString, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { TaxType } from '../../schemas/tax-jurisdiction.schema';

export class TaxRateDto {
  @IsEnum(TaxType)
  taxType: TaxType;

  @IsNumber()
  @Min(0)
  @Max(1)
  rate: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: Date;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;
}
