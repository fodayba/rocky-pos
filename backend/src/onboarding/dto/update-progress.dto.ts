import { IsString, IsIn } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  @IsIn(['welcomeViewed', 'locationSetup', 'completionViewed'])
  step: string;
}
