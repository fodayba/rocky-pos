import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, IsNumber, IsBoolean, IsArray, Min } from 'class-validator';
import { AccountStatus, PaymentTerms } from '../../schemas/fleet-account.schema';

export class CreateFleetAccountDto {
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  billingAddress?: string;

  @IsString()
  @IsOptional()
  billingCity?: string;

  @IsString()
  @IsOptional()
  billingState?: string;

  @IsString()
  @IsOptional()
  billingZipCode?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  businessLicenseNumber?: string;

  @IsEnum(PaymentTerms)
  @IsOptional()
  paymentTerms?: PaymentTerms;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  creditLimit: number;

  @IsArray()
  @IsOptional()
  allowedProducts?: string[];

  @IsArray()
  @IsOptional()
  restrictedProducts?: string[];

  @IsArray()
  @IsOptional()
  allowedLocations?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxTransactionAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dailySpendLimit?: number;

  @IsBoolean()
  @IsOptional()
  requireOdometer?: boolean;

  @IsBoolean()
  @IsOptional()
  requireDriverId?: boolean;

  @IsBoolean()
  @IsOptional()
  fuelOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  emailInvoice?: boolean;

  @IsEmail()
  @IsOptional()
  invoiceEmail?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
