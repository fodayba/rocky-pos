import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  price: number;

  @IsNumber()
  cost: number;

  @IsNumber()
  stockQuantity: number;

  @IsNumber()
  minStockLevel: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsString()
  @IsNotEmpty()
  supplier: string;

  @IsBoolean()
  taxable: boolean;

  @IsNumber()
  taxRate: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
