import { IsNumber, IsString, IsOptional, IsArray, ValidateNested, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class TaxableItemDto {
  @IsString()
  category: string; // 'fuel', 'tobacco', 'alcohol', 'prepared_food', 'general'

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  taxExempt?: boolean;
}

export class CalculateTaxDto {
  @IsString()
  zipCode: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxableItemDto)
  items: TaxableItemDto[];

  @IsOptional()
  @IsString()
  transactionDate?: string;
}
