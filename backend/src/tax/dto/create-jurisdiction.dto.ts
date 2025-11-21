import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TaxRateDto } from './tax-rate.dto';

export class CreateJurisdictionDto {
  @IsString()
  jurisdictionCode: string;

  @IsString()
  name: string;

  @IsString()
  type: string; // 'federal', 'state', 'county', 'city', 'district'

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  zipCodes?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxRateDto)
  taxRates?: TaxRateDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  compositeSalesTaxRate?: number;

  @IsOptional()
  @IsBoolean()
  hasFoodTaxExemption?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  foodTaxRate?: number;

  @IsOptional()
  @IsBoolean()
  hasPreparedFoodTax?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  preparedFoodTaxRate?: number;

  @IsOptional()
  @IsString()
  filingFrequency?: string;

  @IsOptional()
  @IsNumber()
  filingDueDay?: number;

  @IsOptional()
  @IsString()
  taxAuthorityName?: string;

  @IsOptional()
  @IsString()
  taxAuthorityWebsite?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
