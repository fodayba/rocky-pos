import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsEmail, Min } from 'class-validator';

export class CreateGiftCardDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  initialValue: number;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  recipientPhone?: string;

  @IsString()
  @IsOptional()
  purchaserName?: string;

  @IsEmail()
  @IsOptional()
  purchaserEmail?: string;

  @IsBoolean()
  @IsOptional()
  requiresPin?: boolean;

  @IsBoolean()
  @IsOptional()
  neverExpires?: boolean;

  @IsBoolean()
  @IsOptional()
  isDigital?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
