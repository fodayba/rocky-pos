import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { SettingsService, UserSettings, UserProfile, UserPreferences, NotificationPreferences, PasswordChangeData, RecentActivity } from './settings.service';
import { ToastService } from './toast.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let httpClient: any;
  let toastService: ToastService;

  beforeEach(() => {
    // Create a mock HttpClient
    httpClient = {
      get: vi.fn(),
      patch: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    // Create a mock ToastService
    toastService = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    } as any;

    // Create service instance manually and inject mocked dependencies
    service = Object.create(SettingsService.prototype);
    (service as any).http = httpClient;
    (service as any).toastService = toastService;
    (service as any).apiUrl = 'http://localhost:3000/api/users';
    (service as any).MAX_RETRIES = 2;
    (service as any).RETRY_DELAY = 1000;
  });

  describe('getUserSettings', () => {
    it('should make GET request to correct endpoint', (done) => {
      const userId = 'user-123';
      const mockSettings: UserSettings = {
        profile: {
          email: 'test@example.com',
          fullName: 'Test User',
          firstName: 'Test',
          lastName: 'User',
          role: 'cashier',
          createdAt: new Date()
        },
        preferences: {
          locale: 'en-US',
          theme: 'light',
          displayDensity: 'comfortable',
          rememberMe: true
        },
        notifications: {
          email: { sales: true, inventory: true, system: true, security: true },
          inApp: { sales: true, inventory: true, system: true, security: true }
        },
        security: {
          activeSessions: 1,
          twoFactorEnabled: false
        }
      };

      httpClient.get.mockReturnValue(of(mockSettings));

      service.getUserSettings(userId).subscribe({
        next: (settings) => {
          expect(httpClient.get).toHaveBeenCalledWith(
            expect.stringContaining(`/users/${userId}/settings`)
          );
          expect(settings).toEqual(mockSettings);
          done();
        },
        error: done
      });
    });

    it('should handle network errors gracefully', (done) => {
      const userId = 'user-123';
      const networkError = { status: 0, error: new ErrorEvent('Network error') };

      httpClient.get.mockReturnValue(throwError(() => networkError));

      service.getUserSettings(userId).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: (error) => {
          expect(error).toBeDefined();
          expect(error.message).toContain('Unable to connect');
          done();
        }
      });
    });

    it('should handle 401 unauthorized errors', (done) => {
      const userId = 'user-123';
      const unauthorizedError = { status: 401, error: { message: 'Unauthorized' } };

      httpClient.get.mockReturnValue(throwError(() => unauthorizedError));

      service.getUserSettings(userId).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: (error) => {
          expect(error).toBeDefined();
          expect(error.message).toContain('session has expired');
          done();
        }
      });
    });
  });

  describe('updateProfile', () => {
    it('should make PATCH request with correct data', (done) => {
      const userId = 'user-123';
      const profileUpdate = { fullName: 'Updated Name', phone: '555-1234' };
      const mockResponse: UserProfile = {
        email: 'test@example.com',
        fullName: 'Updated Name',
        firstName: 'Updated',
        lastName: 'Name',
        role: 'cashier',
        phone: '555-1234',
        createdAt: new Date()
      };

      httpClient.patch.mockReturnValue(of(mockResponse));

      service.updateProfile(userId, profileUpdate).subscribe({
        next: (profile) => {
          expect(httpClient.patch).toHaveBeenCalledWith(
            expect.stringContaining(`/users/${userId}/profile`),
            profileUpdate
          );
          expect(profile.fullName).toBe('Updated Name');
          expect(profile.phone).toBe('555-1234');
          done();
        },
        error: done
      });
    });

    it('should show error toast on failure', (done) => {
      const userId = 'user-123';
      const profileUpdate = { email: 'invalid-email' };
      const validationError = { status: 400, error: { message: 'Invalid email format' } };

      httpClient.patch.mockReturnValue(throwError(() => validationError));

      service.updateProfile(userId, profileUpdate).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: (error) => {
          expect(toastService.error).toHaveBeenCalled();
          expect(error.message).toContain('Invalid email format');
          done();
        }
      });
    });

    it('should handle 409 conflict errors', (done) => {
      const userId = 'user-123';
      const profileUpdate = { email: 'existing@example.com' };
      const conflictError = { status: 409, error: { message: 'Email already in use' } };

      httpClient.patch.mockReturnValue(throwError(() => conflictError));

      service.updateProfile(userId, profileUpdate).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: (error) => {
          expect(error.message).toContain('Email already in use');
          done();
        }
      });
    });
  });

  describe('updatePreferences', () => {
    it('should make PATCH request with correct data', (done) => {
      const userId = 'user-123';
      const prefsUpdate = { theme: 'dark' as const, displayDensity: 'compact' as const };
      const mockResponse: UserPreferences = {
        locale: 'en-US',
        theme: 'dark',
        displayDensity: 'compact',
        rememberMe: true
      };

      httpClient.patch.mockReturnValue(of(mockResponse));

      service.updatePreferences(userId, prefsUpdate).subscribe({
        next: (prefs) => {
          expect(httpClient.patch).toHaveBeenCalledWith(
            expect.stringContaining(`/users/${userId}/preferences`),
            prefsUpdate
          );
          expect(prefs.theme).toBe('dark');
          expect(prefs.displayDensity).toBe('compact');
          done();
        },
        error: done
      });
    });

    it('should show error toast on failure', (done) => {
      const userId = 'user-123';
      const prefsUpdate = { theme: 'invalid' as any };
      const validationError = { status: 400, error: { message: 'Invalid theme value' } };

      httpClient.patch.mockReturnValue(throwError(() => validationError));

      service.updatePreferences(userId, prefsUpdate).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: () => {
          expect(toastService.error).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('updateNotifications', () => {
    it('should make PATCH request with correct data', (done) => {
      const userId = 'user-123';
      const notifUpdate: NotificationPreferences = {
        email: { sales: false, inventory: true, system: true, security: true },
        inApp: { sales: true, inventory: true, system: false, security: true }
      };

      httpClient.patch.mockReturnValue(of(notifUpdate));

      service.updateNotifications(userId, notifUpdate).subscribe({
        next: (notifs) => {
          expect(httpClient.patch).toHaveBeenCalledWith(
            expect.stringContaining(`/users/${userId}/notifications`),
            notifUpdate
          );
          expect(notifs.email.sales).toBe(false);
          expect(notifs.inApp.system).toBe(false);
          done();
        },
        error: done
      });
    });
  });

  describe('changePassword', () => {
    it('should make POST request with correct data', (done) => {
      const userId = 'user-123';
      const passwordData: PasswordChangeData = {
        currentPassword: 'oldPass123',
        newPassword: 'newPass456',
        confirmPassword: 'newPass456'
      };

      httpClient.post.mockReturnValue(of(undefined));

      service.changePassword(userId, passwordData).subscribe({
        next: () => {
          expect(httpClient.post).toHaveBeenCalledWith(
            expect.stringContaining(`/users/${userId}/password`),
            passwordData
          );
          done();
        },
        error: done
      });
    });

    it('should handle incorrect current password error', (done) => {
      const userId = 'user-123';
      const passwordData: PasswordChangeData = {
        currentPassword: 'wrongPass',
        newPassword: 'newPass456',
        confirmPassword: 'newPass456'
      };
      const authError = { status: 401, error: { message: 'Current password is incorrect' } };

      httpClient.post.mockReturnValue(throwError(() => authError));

      service.changePassword(userId, passwordData).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: (error) => {
          expect(toastService.error).toHaveBeenCalled();
          expect(error.message).toContain('Current password is incorrect');
          done();
        }
      });
    });

    it('should handle password validation errors', (done) => {
      const userId = 'user-123';
      const passwordData: PasswordChangeData = {
        currentPassword: 'oldPass123',
        newPassword: 'weak',
        confirmPassword: 'weak'
      };
      const validationError = { status: 400, error: { message: 'Password does not meet requirements' } };

      httpClient.post.mockReturnValue(throwError(() => validationError));

      service.changePassword(userId, passwordData).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: (error) => {
          expect(error.message).toContain('Password does not meet requirements');
          done();
        }
      });
    });
  });

  describe('logoutAllSessions', () => {
    it('should make POST request and return session count', (done) => {
      const userId = 'user-123';
      const mockResponse = { count: 3 };

      httpClient.post.mockReturnValue(of(mockResponse));

      service.logoutAllSessions(userId).subscribe({
        next: (result) => {
          expect(httpClient.post).toHaveBeenCalledWith(
            expect.stringContaining(`/users/${userId}/sessions/logout-all`),
            {}
          );
          expect(result.count).toBe(3);
          done();
        },
        error: done
      });
    });

    it('should show error toast on failure', (done) => {
      const userId = 'user-123';
      const serverError = { status: 500, error: { message: 'Server error' } };

      httpClient.post.mockReturnValue(throwError(() => serverError));

      service.logoutAllSessions(userId).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: () => {
          expect(toastService.error).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('getRecentActivity', () => {
    it('should make GET request with default limit', (done) => {
      const userId = 'user-123';
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          action: 'login',
          timestamp: new Date(),
          details: 'User logged in',
          ipAddress: '192.168.1.1'
        }
      ];

      httpClient.get.mockReturnValue(of(mockActivity));

      service.getRecentActivity(userId).subscribe({
        next: (activity) => {
          expect(httpClient.get).toHaveBeenCalledWith(
            expect.stringContaining(`/users/${userId}/activity`),
            { params: { limit: '10' } }
          );
          expect(activity).toEqual(mockActivity);
          done();
        },
        error: done
      });
    });

    it('should make GET request with custom limit', (done) => {
      const userId = 'user-123';
      const limit = 25;
      const mockActivity: RecentActivity[] = [];

      httpClient.get.mockReturnValue(of(mockActivity));

      service.getRecentActivity(userId, limit).subscribe({
        next: () => {
          expect(httpClient.get).toHaveBeenCalledWith(
            expect.stringContaining(`/users/${userId}/activity`),
            { params: { limit: '25' } }
          );
          done();
        },
        error: done
      });
    });

    it('should handle empty activity list', (done) => {
      const userId = 'user-123';
      httpClient.get.mockReturnValue(of([]));

      service.getRecentActivity(userId).subscribe({
        next: (activity) => {
          expect(activity).toEqual([]);
          expect(activity.length).toBe(0);
          done();
        },
        error: done
      });
    });
  });

  describe('requestDataExport', () => {
    it('should make POST request and return download URL', (done) => {
      const userId = 'user-123';
      const mockResponse = { downloadUrl: 'https://example.com/export/user-123.json' };

      httpClient.post.mockReturnValue(of(mockResponse));

      service.requestDataExport(userId).subscribe({
        next: (result) => {
          expect(httpClient.post).toHaveBeenCalledWith(
            expect.stringContaining(`/users/${userId}/export`),
            {}
          );
          expect(result.downloadUrl).toBe('https://example.com/export/user-123.json');
          done();
        },
        error: done
      });
    });

    it('should show error toast on failure', (done) => {
      const userId = 'user-123';
      const serverError = { status: 500, error: { message: 'Export generation failed' } };

      httpClient.post.mockReturnValue(throwError(() => serverError));

      service.requestDataExport(userId).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: () => {
          expect(toastService.error).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('deleteAccount', () => {
    it('should make POST request with password', (done) => {
      const userId = 'user-123';
      const password = 'myPassword123';

      httpClient.post.mockReturnValue(of(undefined));

      service.deleteAccount(userId, password).subscribe({
        next: () => {
          expect(httpClient.post).toHaveBeenCalledWith(
            expect.stringContaining(`/users/${userId}/delete`),
            { password }
          );
          done();
        },
        error: done
      });
    });

    it('should handle incorrect password error', (done) => {
      const userId = 'user-123';
      const password = 'wrongPassword';
      const authError = { status: 401, error: { message: 'Incorrect password' } };

      httpClient.post.mockReturnValue(throwError(() => authError));

      service.deleteAccount(userId, password).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: (error) => {
          expect(toastService.error).toHaveBeenCalled();
          expect(error.message).toContain('session has expired');
          done();
        }
      });
    });

    it('should show error toast on failure', (done) => {
      const userId = 'user-123';
      const password = 'myPassword123';
      const serverError = { status: 500, error: { message: 'Deletion failed' } };

      httpClient.post.mockReturnValue(throwError(() => serverError));

      service.deleteAccount(userId, password).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: () => {
          expect(toastService.error).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 403 forbidden errors', (done) => {
      const userId = 'user-123';
      const forbiddenError = { status: 403, error: { message: 'Forbidden' } };

      httpClient.get.mockReturnValue(throwError(() => forbiddenError));

      service.getUserSettings(userId).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: (error) => {
          expect(error.message).toContain('permission');
          done();
        }
      });
    });

    it('should handle 404 not found errors', (done) => {
      const userId = 'nonexistent-user';
      const notFoundError = { status: 404, error: { message: 'User not found' } };

      httpClient.get.mockReturnValue(throwError(() => notFoundError));

      service.getUserSettings(userId).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: (error) => {
          expect(error.message).toContain('not found');
          done();
        }
      });
    });

    it('should handle 422 validation errors', (done) => {
      const userId = 'user-123';
      const validationError = { status: 422, error: { message: 'Validation failed' } };

      httpClient.patch.mockReturnValue(throwError(() => validationError));

      service.updateProfile(userId, { email: 'invalid' }).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: (error) => {
          expect(error.message).toContain('Validation failed');
          done();
        }
      });
    });

    it('should handle generic server errors', (done) => {
      const userId = 'user-123';
      const serverError = { status: 503, error: { message: 'Service unavailable' } };

      httpClient.get.mockReturnValue(throwError(() => serverError));

      service.getUserSettings(userId).subscribe({
        next: () => done(new Error('Should have thrown error')),
        error: (error) => {
          expect(error.message).toContain('Server error');
          done();
        }
      });
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform profile data', (done) => {
      const userId = 'user-123';
      const mockProfile: UserProfile = {
        email: 'test@example.com',
        fullName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        phone: '555-0123',
        employeeId: 'EMP001',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date('2024-12-01')
      };

      httpClient.patch.mockReturnValue(of(mockProfile));

      service.updateProfile(userId, { fullName: 'Test User' }).subscribe({
        next: (profile) => {
          expect(profile.email).toBe('test@example.com');
          expect(profile.fullName).toBe('Test User');
          expect(profile.role).toBe('admin');
          expect(profile.phone).toBe('555-0123');
          expect(profile.employeeId).toBe('EMP001');
          expect(profile.createdAt).toBeInstanceOf(Date);
          done();
        },
        error: done
      });
    });

    it('should correctly transform preferences data', (done) => {
      const userId = 'user-123';
      const mockPrefs: UserPreferences = {
        locale: 'en-SL',
        theme: 'dark',
        displayDensity: 'spacious',
        rememberMe: false,
        sessionTimeout: 7200
      };

      httpClient.patch.mockReturnValue(of(mockPrefs));

      service.updatePreferences(userId, mockPrefs).subscribe({
        next: (prefs) => {
          expect(prefs.locale).toBe('en-SL');
          expect(prefs.theme).toBe('dark');
          expect(prefs.displayDensity).toBe('spacious');
          expect(prefs.rememberMe).toBe(false);
          expect(prefs.sessionTimeout).toBe(7200);
          done();
        },
        error: done
      });
    });

    it('should correctly transform activity data with dates', (done) => {
      const userId = 'user-123';
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          action: 'login',
          timestamp: new Date('2024-12-01T10:00:00Z'),
          details: 'User logged in from Chrome',
          ipAddress: '192.168.1.100'
        },
        {
          id: '2',
          action: 'profile_update',
          timestamp: new Date('2024-12-01T11:30:00Z'),
          details: 'Updated profile information'
        }
      ];

      httpClient.get.mockReturnValue(of(mockActivity));

      service.getRecentActivity(userId).subscribe({
        next: (activity) => {
          expect(activity.length).toBe(2);
          expect(activity[0].action).toBe('login');
          expect(activity[0].timestamp).toBeInstanceOf(Date);
          expect(activity[0].ipAddress).toBe('192.168.1.100');
          expect(activity[1].action).toBe('profile_update');
          expect(activity[1].ipAddress).toBeUndefined();
          done();
        },
        error: done
      });
    });
  });
});
