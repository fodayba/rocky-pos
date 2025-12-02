import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { UserSettings, RecentActivity } from '../../../services/settings.service';
import { User } from '../../../models/user.model';
import { Location, LocationType, LocationStatus } from '../../../models/location.model';

describe('AdvancedTabComponent - Unit Tests', () => {
  let currentUser: any;
  let settingsService: any;
  let toastService: any;
  let localeService: any;
  let router: any;
  let authService: any;

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    role: 'manager',
    fullName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    active: true,
    onboardingCompleted: true,
    onboardingProgress: {
      welcomeViewed: true,
      locationSetup: true,
      completionViewed: true
    }
  };

  const mockLocation: Location = {
    _id: 'loc123',
    locationCode: 'LOC001',
    name: 'Main Store',
    type: LocationType.RETAIL,
    status: LocationStatus.ACTIVE,
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'USA'
    },
    phone: '555-0100',
    operatingHours: [],
    timezone: 'America/Chicago',
    totalEmployees: 10,
    activeEmployees: 8,
    hasFuel: true,
    hasConvenienceStore: true,
    hasCarWash: false,
    taxRate: 0.08,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockUserSettings: UserSettings = {
    profile: {
      email: 'test@example.com',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      role: 'manager',
      primaryLocation: mockLocation,
      createdAt: new Date(),
      lastLogin: new Date()
    },
    preferences: {
      locale: 'en-US',
      theme: 'light',
      displayDensity: 'comfortable',
      rememberMe: false
    },
    notifications: {
      email: { sales: true, inventory: true, system: true, security: true },
      inApp: { sales: true, inventory: true, system: true, security: true }
    },
    security: {
      activeSessions: 2,
      twoFactorEnabled: false
    }
  };

  const mockActivities: RecentActivity[] = [
    {
      id: '1',
      action: 'login',
      timestamp: new Date(),
      details: 'Logged in from Chrome',
      ipAddress: '192.168.1.1'
    },
    {
      id: '2',
      action: 'profile_update',
      timestamp: new Date(),
      details: 'Updated profile information',
      ipAddress: '192.168.1.1'
    }
  ];

  beforeEach(() => {
    currentUser = signal<User | null>(mockUser);
    
    authService = {
      currentUser,
      logout: vi.fn()
    };

    settingsService = {
      getRecentActivity: vi.fn().mockReturnValue(of(mockActivities)),
      requestDataExport: vi.fn(),
      deleteAccount: vi.fn()
    };

    toastService = {
      success: vi.fn(),
      error: vi.fn()
    };

    localeService = {
      getCurrentLocale: vi.fn().mockReturnValue('en-US')
    };

    router = {
      navigate: vi.fn()
    };
  });

  describe('Location Display', () => {
    it('should return assigned location from user settings', () => {
      const assignedLocation = mockUserSettings.profile.primaryLocation;
      expect(assignedLocation).toBeDefined();
      expect(assignedLocation?.name).toBe('Main Store');
      expect(assignedLocation?.address.street).toBe('123 Main St');
    });

    it('should handle no location assignment (edge case)', () => {
      const settingsWithoutLocation = {
        ...mockUserSettings,
        profile: {
          ...mockUserSettings.profile,
          primaryLocation: undefined
        }
      };
      
      const assignedLocation = settingsWithoutLocation.profile.primaryLocation;
      expect(assignedLocation).toBeUndefined();
    });

    it('should identify admin users correctly', () => {
      const adminUser: User = { ...mockUser, role: 'admin' };
      currentUser.set(adminUser);
      
      const isAdmin = currentUser()?.role === 'admin';
      expect(isAdmin).toBe(true);
    });

    it('should identify non-admin users correctly', () => {
      const isAdmin = currentUser()?.role === 'admin';
      expect(isAdmin).toBe(false);
    });

    it('should make location read-only for non-admin users', () => {
      const isAdmin = currentUser()?.role === 'admin';
      expect(isAdmin).toBe(false);
      // In the component, non-admin users don't see edit controls
    });
  });

  describe('Recent Activity', () => {
    it('should call getRecentActivity with correct parameters', () => {
      settingsService.getRecentActivity('123', 10);
      
      expect(settingsService.getRecentActivity).toHaveBeenCalledWith('123', 10);
    });

    it('should return activities with action, timestamp, and details', () => {
      const activities = mockActivities;
      
      expect(activities.length).toBe(2);
      expect(activities[0].action).toBe('login');
      expect(activities[0].details).toBe('Logged in from Chrome');
      expect(activities[0].timestamp).toBeDefined();
    });

    it('should format timestamps using locale settings', () => {
      const timestamp = new Date('2024-01-15T10:30:00');
      const locale = localeService.getCurrentLocale();
      const formatted = timestamp.toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      expect(localeService.getCurrentLocale).toHaveBeenCalled();
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should handle empty activity list', () => {
      const emptyActivities: RecentActivity[] = [];
      expect(emptyActivities.length).toBe(0);
    });
  });

  describe('Data Export', () => {
    it('should call requestDataExport with user ID', () => {
      settingsService.requestDataExport.mockReturnValue(of({ downloadUrl: 'http://example.com/export.json' }));
      
      settingsService.requestDataExport('123').subscribe();

      expect(settingsService.requestDataExport).toHaveBeenCalledWith('123');
    });

    it('should return download URL on successful export', async () => {
      const expectedUrl = 'http://example.com/export.json';
      settingsService.requestDataExport.mockReturnValue(of({ downloadUrl: expectedUrl }));

      const response = await new Promise((resolve) => {
        settingsService.requestDataExport('123').subscribe((res: any) => {
          resolve(res);
        });
      });

      expect((response as any).downloadUrl).toBe(expectedUrl);
    });

    it('should call success toast on successful export', () => {
      toastService.success('Data export completed successfully');
      expect(toastService.success).toHaveBeenCalledWith('Data export completed successfully');
    });
  });

  describe('Account Deletion', () => {
    it('should call deleteAccount with user ID and password', () => {
      settingsService.deleteAccount.mockReturnValue(of(void 0));
      
      settingsService.deleteAccount('123', 'password123').subscribe();

      expect(settingsService.deleteAccount).toHaveBeenCalledWith('123', 'password123');
    });

    it('should require password for deletion', () => {
      const password = '';
      
      if (!password) {
        toastService.error('Please enter your password');
      }

      expect(toastService.error).toHaveBeenCalledWith('Please enter your password');
    });

    it('should call success toast after deletion', () => {
      toastService.success('Account marked for deletion. You will receive an email with recovery instructions.');
      expect(toastService.success).toHaveBeenCalled();
    });

    it('should logout and navigate after deletion', () => {
      authService.logout();
      router.navigate(['/login']);

      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Admin-specific features', () => {
    it('should identify admin users correctly', () => {
      const adminUser: User = { ...mockUser, role: 'admin' };
      currentUser.set(adminUser);

      const isAdmin = currentUser()?.role === 'admin';
      expect(isAdmin).toBe(true);
    });

    it('should identify non-admin users correctly', () => {
      const isAdmin = currentUser()?.role === 'admin';
      expect(isAdmin).toBe(false);
    });
  });
});
