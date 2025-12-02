import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLocationDto } from '../../locations/dto/create-location.dto';

export class CompleteOnboardingDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocationDto)
  locationData?: CreateLocationDto;
}
