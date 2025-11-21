import { IsDateString, IsString } from 'class-validator';

export class AdjustTimeDto {
  @IsDateString()
  clockIn: Date;

  @IsDateString()
  clockOut: Date;

  @IsString()
  adjustmentReason: string;
}
