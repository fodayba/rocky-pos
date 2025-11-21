import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class InventoryReportDto {
  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsBoolean()
  lowStockOnly?: boolean;

  @IsOptional()
  @IsString()
  category?: string;
}
