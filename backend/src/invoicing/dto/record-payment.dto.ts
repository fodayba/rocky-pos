import { IsNumber, IsString, IsDateString, IsOptional, Min } from 'class-validator';

export class RecordPaymentDto {
  @IsDateString()
  paymentDate: Date;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  paymentMethod: string; // check, ach, card, cash

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
