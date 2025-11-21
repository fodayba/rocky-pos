import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { PromotionType } from '../../schemas/promotion.schema';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PromotionType)
  @IsNotEmpty()
  type: PromotionType;

  @IsArray()
  @IsOptional()
  applicableLocations?: string[];

  @IsArray()
  @IsOptional()
  applicableProducts?: string[];

  @IsArray()
  @IsOptional()
  applicableCategories?: string[];

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsArray()
  @IsOptional()
  daysOfWeek?: number[];

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  pointsMultiplier?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  buyQuantity?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  getQuantity?: number;

  @IsString()
  @IsOptional()
  getProductId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumPurchaseAmount?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  minimumQuantity?: number;

  @IsArray()
  @IsOptional()
  requiredCustomerTiers?: string[];

  @IsBoolean()
  @IsOptional()
  newCustomersOnly?: boolean;

  @IsNumber()
  @Min(1)
  @IsOptional()
  usageLimitPerCustomer?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  totalUsageLimit?: number;

  @IsBoolean()
  @IsOptional()
  stackable?: boolean;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsString()
  @IsOptional()
  couponCode?: string;

  @IsBoolean()
  @IsOptional()
  requiresCouponCode?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  terms?: string;
}
