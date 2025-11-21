import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsNumber()
  @Min(1)
  quantityRequested: number;
}

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  fromLocationId: string;

  @IsString()
  @IsNotEmpty()
  toLocationId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransferItemDto)
  items: TransferItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
