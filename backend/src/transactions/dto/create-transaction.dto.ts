import { IsString, IsNotEmpty, IsNumber, IsEnum, IsArray, IsOptional } from 'class-validator';
import { TransactionType, PaymentMethod } from '../../schemas/transaction.schema';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  transactionNumber: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsArray()
  items: any[];

  @IsNumber()
  subtotal: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  total: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNumber()
  @IsOptional()
  cashReceived?: number;

  @IsNumber()
  @IsOptional()
  changeGiven?: number;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  cashierId: string;

  @IsString()
  @IsNotEmpty()
  shiftId: string;
}
