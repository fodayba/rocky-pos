import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Location } from '../schemas/location.schema';
import { OnboardingStatusDto } from './dto/onboarding-status.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CreateLocationDto } from '../locations/dto/create-location.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Location.name) private locationModel: Model<Location>,
  ) {}

  async getOnboardingStatus(userId: string): Promise<OnboardingStatusDto> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      completed: user.onboardingCompleted,
      completedAt: user.onboardingCompletedAt,
      progress: user.onboardingProgress,
    };
  }

  async updateProgress(userId: string, updateProgressDto: UpdateProgressDto): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.onboardingCompleted) {
      throw new BadRequestException('Onboarding already completed');
    }

    const { step } = updateProgressDto;
    
    // Update the specific step in onboarding progress
    if (step in user.onboardingProgress) {
      user.onboardingProgress[step] = true;
      await user.save();
    } else {
      throw new BadRequestException(`Invalid onboarding step: ${step}`);
    }
  }

  async createOnboardingLocation(userId: string, locationData: CreateLocationDto): Promise<Location> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.onboardingCompleted) {
      throw new BadRequestException('Onboarding already completed');
    }

    // Create the location
    const location = new this.locationModel(locationData);
    await location.save();

    // Assign location to user
    user.primaryLocation = location._id;
    user.assignedLocations.push(location._id);
    user.onboardingProgress.locationSetup = true;
    await user.save();

    return location;
  }

  async completeOnboarding(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.onboardingCompleted) {
      throw new BadRequestException('Onboarding already completed');
    }

    // Mark onboarding as complete
    user.onboardingCompleted = true;
    user.onboardingCompletedAt = new Date();
    user.onboardingProgress.completionViewed = true;
    await user.save();
  }
}
