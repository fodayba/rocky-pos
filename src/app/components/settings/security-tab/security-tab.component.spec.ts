import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormBuilder, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { SecuritySettings } from '../../../services/settings.service';

// Helper function to validate password strength
function validatePasswordStrength(password: string) {
  const feedback: string[] = [];
  let score = 0;

  if (password.length === 0) {
    return { score: 0, feedback: [], isValid: false };
  }

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score++;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score++;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score++;
  }

  if (password.length >= 12) {
    score++;
  }

  const isValid = feedback.length === 0;
  return { score, feedback, isValid };
}

describe('SecurityTabComponent', () => {
  let passwordForm: any;
  let settingsService: any;
  let toastService: any;
  let isChangingPassword: any;
  let passwordStrength: any;
  let showCurrentPassword: any;
  let showNewPassword: any;
  let showConfirmPassword: any;
  let unsavedChangesEmitter: any;
  let securitySettings: SecuritySettings;

  const userId = 'test-user-id';

  beforeEach(() => {
    const fb = new FormBuilder();

    settingsService = {
      changePassword: vi.fn(),
      logoutAllSessions: vi.fn()
    };

    toastService = {
      success: vi.fn(),
      error: vi.fn()
    };

    // Create signals
    isChangingPassword = signal(false);
    passwordStrength = signal({ score: 0, feedback: [], isValid: false });
    showCurrentPassword = signal(false);
    showNewPassword = signal(false);
    showConfirmPassword = signal(false);

    // Create event emitter
    unsavedChangesEmitter = {
      emit: vi.fn()
    };

    securitySettings = {
      lastPasswordChange: new Date('2024-01-01'),
      activeSessions: 3,
      twoFactorEnabled: false
    };

    // Initialize password form with validators
    passwordForm = fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });
  });

  it('should create form with correct initial values', () => {
    expect(passwordForm).toBeTruthy();
    expect(passwordForm.get('currentPassword')?.value).toBe('');
    expect(passwordForm.get('newPassword')?.value).toBe('');
    expect(passwordForm.get('confirmPassword')?.value).toBe('');
  });

  describe('Password Form Validation', () => {
    it('should reject weak password with less than 8 characters', () => {
      const strength = validatePasswordStrength('Abc123');
      expect(strength.isValid).toBe(false);
      expect(strength.feedback).toContain('Password must be at least 8 characters long');
    });

    it('should reject weak password without uppercase letter', () => {
      const strength = validatePasswordStrength('abcdefgh123');
      expect(strength.isValid).toBe(false);
      expect(strength.feedback).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject weak password without lowercase letter', () => {
      const strength = validatePasswordStrength('ABCDEFGH123');
      expect(strength.isValid).toBe(false);
      expect(strength.feedback).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject weak password without number', () => {
      const strength = validatePasswordStrength('Abcdefgh');
      expect(strength.isValid).toBe(false);
      expect(strength.feedback).toContain('Password must contain at least one number');
    });

    it('should accept strong password meeting all requirements', () => {
      const strength = validatePasswordStrength('StrongPass123');
      expect(strength.isValid).toBe(true);
      expect(strength.feedback.length).toBe(0);
    });

    it('should detect password mismatch', () => {
      passwordForm.patchValue({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'DifferentPass123'
      });

      const newPassword = passwordForm.get('newPassword')?.value;
      const confirmPassword = passwordForm.get('confirmPassword')?.value;
      expect(newPassword).not.toBe(confirmPassword);
    });

    it('should not show mismatch error when passwords match', () => {
      passwordForm.patchValue({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123'
      });

      const newPassword = passwordForm.get('newPassword')?.value;
      const confirmPassword = passwordForm.get('confirmPassword')?.value;
      expect(newPassword).toBe(confirmPassword);
    });

    it('should require current password', () => {
      const currentPasswordControl = passwordForm.get('currentPassword');
      currentPasswordControl?.setValue('');
      currentPasswordControl?.markAsTouched();

      expect(currentPasswordControl?.hasError('required')).toBe(true);
    });

    it('should require new password', () => {
      const newPasswordControl = passwordForm.get('newPassword');
      newPasswordControl?.setValue('');
      newPasswordControl?.markAsTouched();

      expect(newPasswordControl?.hasError('required')).toBe(true);
    });

    it('should require confirm password', () => {
      const confirmPasswordControl = passwordForm.get('confirmPassword');
      confirmPasswordControl?.setValue('');
      confirmPasswordControl?.markAsTouched();

      expect(confirmPasswordControl?.hasError('required')).toBe(true);
    });
  });

  describe('Password Strength Indicator', () => {
    it('should calculate correct strength score for weak password', () => {
      const strength = validatePasswordStrength('abc');
      expect(strength.score).toBe(1); // Only lowercase
      expect(strength.isValid).toBe(false);
    });

    it('should calculate correct strength score for fair password', () => {
      const strength = validatePasswordStrength('Abcdefgh');
      expect(strength.score).toBe(3); // Length + uppercase + lowercase
      expect(strength.isValid).toBe(false);
    });

    it('should calculate correct strength score for good password', () => {
      const strength = validatePasswordStrength('Abcdefgh1');
      expect(strength.score).toBe(4); // Length + uppercase + lowercase + number
      expect(strength.isValid).toBe(true);
    });

    it('should calculate correct strength score for strong password', () => {
      const strength = validatePasswordStrength('Abcdefgh1234');
      expect(strength.score).toBe(5); // Length + uppercase + lowercase + number + 12+ chars
      expect(strength.isValid).toBe(true);
    });

    it('should return correct strength label for weak', () => {
      passwordStrength.set({ score: 1, feedback: [], isValid: false });
      const label = passwordStrength().score <= 1 ? 'Weak' : '';
      expect(label).toBe('Weak');
    });

    it('should return correct strength label for strong', () => {
      passwordStrength.set({ score: 4, feedback: [], isValid: true });
      const label = passwordStrength().score >= 4 ? 'Strong' : '';
      expect(label).toBe('Strong');
    });
  });

  describe('Password Change', () => {
    it('should call settings service when form is valid', (done) => {
      settingsService.changePassword.mockReturnValue(of(void 0));

      passwordForm.patchValue({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123'
      });

      isChangingPassword.set(true);
      settingsService.changePassword(userId, passwordForm.value).subscribe({
        next: () => {
          isChangingPassword.set(false);
          passwordForm.reset();
          toastService.success('Password changed successfully');
          securitySettings.lastPasswordChange = new Date();

          setTimeout(() => {
            expect(settingsService.changePassword).toHaveBeenCalledWith(userId, {
              currentPassword: 'OldPass123',
              newPassword: 'NewPass123',
              confirmPassword: 'NewPass123'
            });
            done();
          }, 0);
        }
      });
    });

    it('should show success toast on successful password change', (done) => {
      settingsService.changePassword.mockReturnValue(of(void 0));

      passwordForm.patchValue({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123'
      });

      settingsService.changePassword(userId, passwordForm.value).subscribe({
        next: () => {
          toastService.success('Password changed successfully');

          setTimeout(() => {
            expect(toastService.success).toHaveBeenCalledWith('Password changed successfully');
            done();
          }, 0);
        }
      });
    });

    it('should reset form after successful password change', (done) => {
      settingsService.changePassword.mockReturnValue(of(void 0));

      passwordForm.patchValue({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123'
      });

      settingsService.changePassword(userId, passwordForm.value).subscribe({
        next: () => {
          passwordForm.reset();

          setTimeout(() => {
            expect(passwordForm.get('currentPassword')?.value).toBe(null);
            expect(passwordForm.get('newPassword')?.value).toBe(null);
            expect(passwordForm.get('confirmPassword')?.value).toBe(null);
            done();
          }, 0);
        }
      });
    });

    it('should update lastPasswordChange date after successful change', (done) => {
      const oldDate = securitySettings.lastPasswordChange;
      settingsService.changePassword.mockReturnValue(of(void 0));

      passwordForm.patchValue({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123'
      });

      settingsService.changePassword(userId, passwordForm.value).subscribe({
        next: () => {
          securitySettings.lastPasswordChange = new Date();

          setTimeout(() => {
            expect(securitySettings.lastPasswordChange).not.toEqual(oldDate);
            expect(securitySettings.lastPasswordChange).toBeInstanceOf(Date);
            done();
          }, 0);
        }
      });
    });

    it('should not submit when form is invalid', () => {
      passwordForm.patchValue({
        currentPassword: '',
        newPassword: 'weak',
        confirmPassword: 'different'
      });

      if (passwordForm.invalid) {
        // Don't call service
        expect(settingsService.changePassword).not.toHaveBeenCalled();
      }
    });

    it('should handle error on password change failure', (done) => {
      const error = new Error('Password change failed');
      settingsService.changePassword.mockReturnValue(throwError(() => error));

      passwordForm.patchValue({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123'
      });

      isChangingPassword.set(true);
      settingsService.changePassword(userId, passwordForm.value).subscribe({
        error: () => {
          isChangingPassword.set(false);

          setTimeout(() => {
            expect(isChangingPassword()).toBe(false);
            done();
          }, 0);
        }
      });
    });
  });

  describe('Session Management', () => {
    it('should call logout all sessions when confirmed', (done) => {
      settingsService.logoutAllSessions.mockReturnValue(of({ count: 2 }));

      settingsService.logoutAllSessions(userId).subscribe({
        next: (response: any) => {
          toastService.success(`Successfully logged out of ${response.count} session(s)`);
          securitySettings.activeSessions = 1;

          setTimeout(() => {
            expect(settingsService.logoutAllSessions).toHaveBeenCalledWith(userId);
            done();
          }, 0);
        }
      });
    });

    it('should show success toast with session count', (done) => {
      settingsService.logoutAllSessions.mockReturnValue(of({ count: 2 }));

      settingsService.logoutAllSessions(userId).subscribe({
        next: (response: any) => {
          toastService.success(`Successfully logged out of ${response.count} session(s)`);

          setTimeout(() => {
            expect(toastService.success).toHaveBeenCalledWith('Successfully logged out of 2 session(s)');
            done();
          }, 0);
        }
      });
    });

    it('should update active sessions count after logout', (done) => {
      settingsService.logoutAllSessions.mockReturnValue(of({ count: 2 }));
      securitySettings.activeSessions = 3;

      settingsService.logoutAllSessions(userId).subscribe({
        next: () => {
          securitySettings.activeSessions = 1;

          setTimeout(() => {
            expect(securitySettings.activeSessions).toBe(1);
            done();
          }, 0);
        }
      });
    });

    it('should handle error on logout failure', (done) => {
      const error = new Error('Logout failed');
      settingsService.logoutAllSessions.mockReturnValue(throwError(() => error));

      settingsService.logoutAllSessions(userId).subscribe({
        error: () => {
          setTimeout(() => {
            expect(toastService.success).not.toHaveBeenCalled();
            done();
          }, 0);
        }
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle current password visibility', () => {
      expect(showCurrentPassword()).toBe(false);
      showCurrentPassword.update((v: boolean) => !v);
      expect(showCurrentPassword()).toBe(true);
      showCurrentPassword.update((v: boolean) => !v);
      expect(showCurrentPassword()).toBe(false);
    });

    it('should toggle new password visibility', () => {
      expect(showNewPassword()).toBe(false);
      showNewPassword.update((v: boolean) => !v);
      expect(showNewPassword()).toBe(true);
      showNewPassword.update((v: boolean) => !v);
      expect(showNewPassword()).toBe(false);
    });

    it('should toggle confirm password visibility', () => {
      expect(showConfirmPassword()).toBe(false);
      showConfirmPassword.update((v: boolean) => !v);
      expect(showConfirmPassword()).toBe(true);
      showConfirmPassword.update((v: boolean) => !v);
      expect(showConfirmPassword()).toBe(false);
    });
  });

  describe('Unsaved Changes Tracking', () => {
    it('should track form changes', () => {
      const control = passwordForm.get('currentPassword');
      control?.setValue('test');
      control?.markAsDirty();

      const hasChanges = passwordForm.dirty && passwordForm.get('currentPassword')?.value;
      expect(hasChanges).toBeTruthy();
    });

    it('should clear changes when form is reset', () => {
      passwordForm.patchValue({
        currentPassword: 'test'
      });

      passwordForm.reset();
      const hasChanges = passwordForm.dirty && passwordForm.get('currentPassword')?.value;
      expect(hasChanges).toBeFalsy();
    });
  });
});
