import { Location } from './location.model';

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface OnboardingProgress {
  welcomeViewed: boolean;
  locationSetup: boolean;
  completionViewed: boolean;
}

export interface User {
  id: string;
  _id?: string; // MongoDB ID for backend compatibility
  email: string;
  role: UserRole;
  fullName: string;
  firstName: string;
  lastName: string;
  active: boolean;
  onboardingCompleted: boolean;
  onboardingProgress: OnboardingProgress;
  primaryLocation?: Location;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: User;
}
