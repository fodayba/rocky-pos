import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { onboardingGuard } from './onboarding.guard';
import { AuthService } from '../services/auth.service';

describe('onboardingGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'onboardingCompleted',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow access to public routes (login, signup)', () => {
    const loginRoute = { url: '/login' } as any;
    const signupRoute = { url: '/signup' } as any;

    const loginResult = TestBed.runInInjectionContext(() =>
      onboardingGuard(loginRoute, { url: '/login' } as any)
    );
    const signupResult = TestBed.runInInjectionContext(() =>
      onboardingGuard(signupRoute, { url: '/signup' } as any)
    );

    expect(loginResult).toBe(true);
    expect(signupResult).toBe(true);
  });

  it('should redirect unauthenticated users to login', () => {
    authService.isAuthenticated.and.returnValue(false);
    const mockUrlTree = {} as UrlTree;
    router.parseUrl.and.returnValue(mockUrlTree);

    const route = {} as any;
    const state = { url: '/dashboard' } as any;

    const result = TestBed.runInInjectionContext(() =>
      onboardingGuard(route, state)
    );

    expect(authService.isAuthenticated).toHaveBeenCalled();
    expect(router.parseUrl).toHaveBeenCalledWith('/login');
    expect(result).toBe(mockUrlTree);
  });

  describe('backward compatibility', () => {
    it('should allow existing users with completed onboarding to access dashboard', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.onboardingCompleted.and.returnValue(true);

      const route = {} as any;
      const state = { url: '/dashboard' } as any;

      const result = TestBed.runInInjectionContext(() =>
        onboardingGuard(route, state)
      );

      expect(result).toBe(true);
      expect(authService.onboardingCompleted).toHaveBeenCalled();
    });

    it('should redirect existing users with completed onboarding away from onboarding route', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.onboardingCompleted.and.returnValue(true);
      const mockUrlTree = {} as UrlTree;
      router.parseUrl.and.returnValue(mockUrlTree);

      const route = {} as any;
      const state = { url: '/onboarding' } as any;

      const result = TestBed.runInInjectionContext(() =>
        onboardingGuard(route, state)
      );

      expect(router.parseUrl).toHaveBeenCalledWith('/dashboard');
      expect(result).toBe(mockUrlTree);
    });

    it('should redirect new users with incomplete onboarding to onboarding flow', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.onboardingCompleted.and.returnValue(false);
      const mockUrlTree = {} as UrlTree;
      router.parseUrl.and.returnValue(mockUrlTree);

      const route = {} as any;
      const state = { url: '/dashboard' } as any;

      const result = TestBed.runInInjectionContext(() =>
        onboardingGuard(route, state)
      );

      expect(router.parseUrl).toHaveBeenCalledWith('/onboarding');
      expect(result).toBe(mockUrlTree);
    });

    it('should allow new users with incomplete onboarding to access onboarding route', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.onboardingCompleted.and.returnValue(false);

      const route = {} as any;
      const state = { url: '/onboarding' } as any;

      const result = TestBed.runInInjectionContext(() =>
        onboardingGuard(route, state)
      );

      expect(result).toBe(true);
    });

    it('should handle migrated users (existing users marked as completed)', () => {
      // Simulate a user who was migrated with onboardingCompleted=true
      authService.isAuthenticated.and.returnValue(true);
      authService.onboardingCompleted.and.returnValue(true);

      const route = {} as any;
      const state = { url: '/pos' } as any;

      const result = TestBed.runInInjectionContext(() =>
        onboardingGuard(route, state)
      );

      expect(result).toBe(true);
      expect(authService.onboardingCompleted).toHaveBeenCalled();
    });
  });

  describe('route protection', () => {
    it('should protect all non-public routes for incomplete onboarding', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.onboardingCompleted.and.returnValue(false);
      const mockUrlTree = {} as UrlTree;
      router.parseUrl.and.returnValue(mockUrlTree);

      const protectedRoutes = [
        '/dashboard',
        '/pos',
        '/customers',
        '/inventory',
        '/reports',
      ];

      protectedRoutes.forEach((url) => {
        const route = {} as any;
        const state = { url } as any;

        const result = TestBed.runInInjectionContext(() =>
          onboardingGuard(route, state)
        );

        expect(result).toBe(mockUrlTree);
        expect(router.parseUrl).toHaveBeenCalledWith('/onboarding');
      });
    });

    it('should allow access to all routes for completed onboarding', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.onboardingCompleted.and.returnValue(true);

      const allowedRoutes = [
        '/dashboard',
        '/pos',
        '/customers',
        '/inventory',
        '/reports',
      ];

      allowedRoutes.forEach((url) => {
        const route = {} as any;
        const state = { url } as any;

        const result = TestBed.runInInjectionContext(() =>
          onboardingGuard(route, state)
        );

        expect(result).toBe(true);
      });
    });
  });
});
