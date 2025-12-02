import { IsOptional, IsString, IsBoolean, IsNumber, IsIn } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsIn(['compact', 'comfortable', 'spacious'])
  displayDensity?: 'compact' | 'comfortable' | 'spacious';

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @IsOptional()
  @IsNumber()
  sessionTimeout?: number;
}
