import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class NotificationCategoryDto {
  sales?: boolean;
  inventory?: boolean;
  system?: boolean;
  security?: boolean;
}

export class UpdateNotificationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationCategoryDto)
  email?: NotificationCategoryDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationCategoryDto)
  inApp?: NotificationCategoryDto;
}
