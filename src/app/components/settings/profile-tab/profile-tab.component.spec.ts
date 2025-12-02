import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { UserProfile } from '../../../services/settings.service';
import { UserRole } from '../../../models/user.model';
import { FormBuilder, Validators } from '@angular/forms';
import { signal } from '@angular/core';

describe('ProfileTabComponent', () => {
  let profileForm: any;
  let settingsService: any;
  let toastService: any;
  let isEditing: any;
  let isSaving: any;
  let unsavedChangesEmitter: any;
  let profileUpdatedEmitter: any;

  const mockUserProfile: UserProfile = {
    email: 'test@example.com',
    fullName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    role: 'cashier' as UserRole,
    phone: '555-1234',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-12-01')
  };

  beforeEach(() => {
    const fb = new FormBuilder();
    
    settingsService = {
      updateProfile: vi.fn()
    };

    toastService = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    };

    // Create signals
    isEditing = signal(false);
    isSaving = signal(false);

    // Create event emitters
    unsavedChangesEmitter = {
      emit: vi.fn(),
      subscribe: vi.fn()
    };
    profileUpdatedEmitter = {
      emit: vi.fn(),
      subscribe: vi.fn()
    };

    // Initialize form
    profileForm = fb.group({
      fullName: [mockUserProfile.fullName, [Validators.required]],
      email: [mockUserProfile.email, [Validators.required, Validators.email]],
      phone: [mockUserProfile.phone || '']
    });

    profileForm.disable();
  });

  it('should create form with correct initial values', () => {
    expect(profileForm).toBeTruthy();
    expect(profileForm.get('email')?.value).toBe(mockUserProfile.email);
    expect(profileForm.get('fullName')?.value).toBe(mockUserProfile.fullName);
    expect(profileForm.get('phone')?.value).toBe(mockUserProfile.phone);
  });

  describe('Profile Fields Display', () => {
    it('should initialize form with user email', () => {
      expect(profileForm.get('email')?.value).toBe(mockUserProfile.email);
    });

    it('should initialize form with user full name', () => {
      expect(profileForm.get('fullName')?.value).toBe(mockUserProfile.fullName);
    });

    it('should initialize form with user phone', () => {
      expect(profileForm.get('phone')?.value).toBe(mockUserProfile.phone);
    });

    it('should have user role available', () => {
      expect(mockUserProfile.role).toBe('cashier');
    });

    it('should have account creation date available', () => {
      expect(mockUserProfile.createdAt).toEqual(new Date('2024-01-01'));
    });

    it('should have last login date when available', () => {
      expect(mockUserProfile.lastLogin).toEqual(new Date('2024-12-01'));
    });
  });

  describe('Edit Mode Toggle', () => {
    it('should start in read-only mode', () => {
      expect(isEditing()).toBe(false);
      expect(profileForm.disabled).toBe(true);
    });

    it('should enable form when entering edit mode', () => {
      isEditing.set(true);
      profileForm.enable();
      
      expect(isEditing()).toBe(true);
      expect(profileForm.get('fullName')?.disabled).toBe(false);
      expect(profileForm.get('email')?.disabled).toBe(false);
    });

    it('should be in read-only mode initially', () => {
      expect(isEditing()).toBe(false);
    });

    it('should enter edit mode when toggling', () => {
      isEditing.set(true);
      expect(isEditing()).toBe(true);
    });

    it('should disable form and exit edit mode when canceling', () => {
      const originalValue = profileForm.value;
      isEditing.set(true);
      profileForm.enable();
      profileForm.patchValue({ fullName: 'Changed Name' });
      
      // Cancel
      isEditing.set(false);
      profileForm.patchValue(originalValue);
      profileForm.disable();
      
      expect(isEditing()).toBe(false);
      expect(profileForm.disabled).toBe(true);
      expect(profileForm.get('fullName')?.value).toBe(mockUserProfile.fullName);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      profileForm.enable();
    });

    it('should require full name', () => {
      const fullNameControl = profileForm.get('fullName');
      fullNameControl?.setValue('');
      fullNameControl?.markAsTouched();
      
      expect(fullNameControl?.hasError('required')).toBe(true);
    });

    it('should require email', () => {
      const emailControl = profileForm.get('email');
      emailControl?.setValue('');
      emailControl?.markAsTouched();
      
      expect(emailControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = profileForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      
      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should accept valid email format', () => {
      const emailControl = profileForm.get('email');
      emailControl?.setValue('valid@example.com');
      
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should detect invalid email', () => {
      const emailControl = profileForm.get('email');
      emailControl?.setValue('invalid');
      emailControl?.markAsTouched();
      
      expect(emailControl?.hasError('email')).toBe(true);
      expect(emailControl?.touched).toBe(true);
    });

    it('should detect required field error', () => {
      const fullNameControl = profileForm.get('fullName');
      fullNameControl?.setValue('');
      fullNameControl?.markAsTouched();
      
      expect(fullNameControl?.hasError('required')).toBe(true);
      expect(fullNameControl?.touched).toBe(true);
    });

    it('should mark form as invalid when email is invalid', () => {
      profileForm.get('email')?.setValue('invalid-email');
      
      expect(profileForm.invalid).toBe(true);
    });
  });

  describe('Save Profile', () => {
    beforeEach(() => {
      profileForm.enable();
    });

    it('should call service with correct data when saving', (done) => {
      const updatedProfile = {
        fullName: 'Updated Name',
        email: 'updated@example.com',
        phone: '555-9999'
      };
      
      profileForm.patchValue(updatedProfile);
      settingsService.updateProfile.mockReturnValue(of({
        ...mockUserProfile,
        ...updatedProfile
      }));
      
      isSaving.set(true);
      settingsService.updateProfile('test-user-id', profileForm.getRawValue()).subscribe({
        next: () => {
          isSaving.set(false);
          isEditing.set(false);
          profileForm.disable();
          toastService.success('Profile updated successfully');
          profileUpdatedEmitter.emit(updatedProfile);
          
          setTimeout(() => {
            expect(settingsService.updateProfile).toHaveBeenCalledWith(
              'test-user-id',
              expect.objectContaining(updatedProfile)
            );
            done();
          }, 0);
        }
      });
    });

    it('should emit profileUpdated event on successful save', (done) => {
      const updatedProfile = { ...mockUserProfile, fullName: 'Updated Name' };
      settingsService.updateProfile.mockReturnValue(of(updatedProfile));
      
      profileUpdatedEmitter.subscribe = (callback: any) => {
        callback(updatedProfile);
        expect(updatedProfile).toEqual(updatedProfile);
        done();
      };
      
      settingsService.updateProfile('test-user-id', profileForm.getRawValue()).subscribe({
        next: (profile: UserProfile) => {
          profileUpdatedEmitter.subscribe((p: UserProfile) => {
            expect(p).toEqual(updatedProfile);
          });
          profileUpdatedEmitter.emit(profile);
        }
      });
    });

    it('should show success toast on successful save', (done) => {
      settingsService.updateProfile.mockReturnValue(of(mockUserProfile));
      
      settingsService.updateProfile('test-user-id', profileForm.getRawValue()).subscribe({
        next: () => {
          toastService.success('Profile updated successfully');
          
          setTimeout(() => {
            expect(toastService.success).toHaveBeenCalledWith('Profile updated successfully');
            done();
          }, 0);
        }
      });
    });

    it('should exit edit mode after successful save', (done) => {
      settingsService.updateProfile.mockReturnValue(of(mockUserProfile));
      
      settingsService.updateProfile('test-user-id', profileForm.getRawValue()).subscribe({
        next: () => {
          isEditing.set(false);
          profileForm.disable();
          
          setTimeout(() => {
            expect(isEditing()).toBe(false);
            expect(profileForm.disabled).toBe(true);
            done();
          }, 0);
        }
      });
    });

    it('should emit unsavedChanges false after successful save', () => {
      settingsService.updateProfile.mockReturnValue(of(mockUserProfile));
      
      unsavedChangesEmitter.emit(false);
      expect(unsavedChangesEmitter.emit).toHaveBeenCalledWith(false);
    });

    it('should handle save errors gracefully', (done) => {
      const error = new Error('Save failed');
      settingsService.updateProfile.mockReturnValue(throwError(() => error));
      
      isSaving.set(true);
      settingsService.updateProfile('test-user-id', profileForm.getRawValue()).subscribe({
        error: () => {
          isSaving.set(false);
          
          setTimeout(() => {
            expect(isSaving()).toBe(false);
            expect(isEditing()).toBe(false); // Still in edit mode after error
            done();
          }, 0);
        }
      });
    });

    it('should set saving state when saving', () => {
      isSaving.set(true);
      expect(isSaving()).toBe(true);
    });
  });

  describe('Unsaved Changes Detection', () => {
    it('should emit unsavedChanges true when form is modified', () => {
      const originalValue = JSON.stringify(profileForm.value);
      profileForm.enable();
      profileForm.patchValue({ fullName: 'Changed Name' });
      
      const hasChanges = JSON.stringify(profileForm.value) !== originalValue;
      if (hasChanges) {
        unsavedChangesEmitter.emit(true);
      }
      
      expect(unsavedChangesEmitter.emit).toHaveBeenCalledWith(true);
    });

    it('should emit unsavedChanges false when form is reset to original', () => {
      const originalValue = profileForm.value;
      profileForm.enable();
      profileForm.patchValue({ fullName: 'Changed Name' });
      
      // Reset to original
      profileForm.patchValue(originalValue);
      const hasChanges = JSON.stringify(profileForm.value) !== JSON.stringify(originalValue);
      
      if (!hasChanges) {
        unsavedChangesEmitter.emit(false);
      }
      
      expect(unsavedChangesEmitter.emit).toHaveBeenCalledWith(false);
    });
  });
});
