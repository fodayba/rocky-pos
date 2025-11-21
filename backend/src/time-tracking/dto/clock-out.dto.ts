import { IsOptional, IsString } from 'class-validator';

export class ClockOutDto {
  @IsOptional()
  @IsString()
  clockOutMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
