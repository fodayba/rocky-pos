import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { SupplierType, PaymentTerms } from '../../schemas/supplier.schema';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  supplierCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(SupplierType)
  @IsNotEmpty()
  type: SupplierType;

  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  fax?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsEnum(PaymentTerms)
  @IsOptional()
  paymentTerms?: PaymentTerms;

  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  @IsString()
  @IsOptional()
  deliverySchedule?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumOrderAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  leadTimeDays?: number;

  @IsOptional()
  preferred?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  productCategories?: string[];
}
