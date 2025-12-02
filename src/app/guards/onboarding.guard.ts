import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Onboarding guard that manages access to routes based on onboarding completion status.
 * 
 * Rules:
 * - Unauthenticated users are redirected to login
 * - Users with incomplete onboarding accessing non-onboarding routes are redirected to /onboarding
 * - Users with complete onboarding accessing /onboarding are redirected to /dashboard
 * - Login and signup routes are always accessible
 */
export const onboardingGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow unauthenticated access to login and signup routes
  const publicRoutes = ['/login', '/signup'];
  if (publicRoutes.some(path => state.url.startsWith(path))) {
    return true;
  }

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  const onboardingCompleted = authService.onboardingCompleted();
  const isOnboardingRoute = state.url.startsWith('/onboarding');

  // If user hasn't completed onboarding and trying to access non-onboarding route
  if (!onboardingCompleted && !isOnboardingRoute) {
    return router.parseUrl('/onboarding');
  }

  // If user has completed onboarding and trying to access onboarding route
  if (onboardingCompleted && isOnboardingRoute) {
    return router.parseUrl('/dashboard');
  }

  return true;
};
