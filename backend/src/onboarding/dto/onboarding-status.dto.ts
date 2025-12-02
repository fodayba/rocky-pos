export class OnboardingStatusDto {
  completed: boolean;
  completedAt?: Date;
  progress: {
    welcomeViewed: boolean;
    locationSetup: boolean;
    completionViewed: boolean;
  };
}
