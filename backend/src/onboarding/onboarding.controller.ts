import { Controller, Get, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingStatusDto } from './dto/onboarding-status.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CreateLocationDto } from '../locations/dto/create-location.dto';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  async getStatus(@Request() req): Promise<OnboardingStatusDto> {
    return this.onboardingService.getOnboardingStatus(req.user.userId);
  }

  @Patch('progress')
  async updateProgress(
    @Request() req,
    @Body() updateProgressDto: UpdateProgressDto,
  ): Promise<{ message: string }> {
    await this.onboardingService.updateProgress(req.user.userId, updateProgressDto);
    return { message: 'Progress updated successfully' };
  }

  @Post('location')
  async createLocation(
    @Request() req,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    return this.onboardingService.createOnboardingLocation(req.user.userId, createLocationDto);
  }

  @Post('complete')
  async completeOnboarding(@Request() req): Promise<{ message: string }> {
    await this.onboardingService.completeOnboarding(req.user.userId);
    return { message: 'Onboarding completed successfully' };
  }
}
