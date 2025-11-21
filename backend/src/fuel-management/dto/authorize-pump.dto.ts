import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AuthorizePumpDto {
  @IsNumber()
  @Min(0)
  authorizedAmount: number;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
