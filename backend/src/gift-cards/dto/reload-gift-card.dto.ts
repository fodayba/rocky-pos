import { IsNumber, Min } from 'class-validator';

export class ReloadGiftCardDto {
  @IsNumber()
  @Min(0.01)
  amount: number;
}
