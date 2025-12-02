import { Component, OnInit, Input, Output, EventEmitter, signal, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService, SecuritySettings, PasswordChangeData } from '../../../services/settings.service';
import { ToastService } from '../../../services/toast.service';
import { IconComponent } from '../../shared/icon/icon.component';

interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

@Component({
  selector: 'app-security-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, IconComponent],
  templateUrl: './security-tab.component.html',
  styleUrl: './security-tab.component.css'
})
export class SecurityTabComponent implements OnInit {
  @Input() securitySettings!: SecuritySettings;
  @Input() userId!: string;
  @Output() unsavedChanges = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private toastService = inject(ToastService);
  private elementRef = inject(ElementRef);

  passwordForm!: FormGroup;
  isChangingPassword = signal(false);
  passwordStrength = signal<PasswordStrength>({ score: 0, feedback: [], isValid: false });
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  ngOnInit(): void {
    this.initPasswordForm();
  }

  private initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, this.passwordStrengthValidator.bind(this)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Track password strength
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(password => {
      this.passwordStrength.set(this.validatePasswordStrength(password || ''));
    });

    // Track form changes for unsaved changes warning
    this.passwordForm.valueChanges.subscribe(() => {
      const hasChanges = this.passwordForm.dirty && 
                        (this.passwordForm.get('currentPassword')?.value || 
                         this.passwordForm.get('newPassword')?.value || 
                         this.passwordForm.get('confirmPassword')?.value);
      this.unsavedChanges.emit(hasChanges);
    });
  }

  /**
   * Custom validator for password strength
   */
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) {
      return null;
    }

    const strength = this.validatePasswordStrength(password);
    return strength.isValid ? null : { weakPassword: { feedback: strength.feedback } };
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Validate password strength according to requirements
   * Requirements: minimum 8 characters, at least one uppercase, one lowercase, one number
   */
  validatePasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    if (password.length === 0) {
      return { score: 0, feedback: [], isValid: false };
    }

    // Check minimum length
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score++;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score++;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score++;
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score++;
    }

    // Additional strength indicators (optional but good to have)
    if (password.length >= 12) {
      score++;
    }

    const isValid = feedback.length === 0;

    return { score, feedback, isValid };
  }

  /**
   * Handle password change form submission
   */
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      this.focusFirstError();
      return;
    }

    this.isChangingPassword.set(true);
    const passwordData: PasswordChangeData = this.passwordForm.value;

    this.settingsService.changePassword(this.userId, passwordData).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordForm.reset();
        this.unsavedChanges.emit(false);
        this.toastService.success('Password changed successfully');
        
        // Update last password change date
        this.securitySettings.lastPasswordChange = new Date();
      },
      error: (error) => {
        this.isChangingPassword.set(false);
        // Error toast is handled by the service
        console.error('Failed to change password:', error);
      }
    });
  }

  /**
   * Logout all other sessions
   */
  logoutAllSessions(): void {
    if (!confirm('Are you sure you want to log out of all other sessions? This will end all active sessions except your current one.')) {
      return;
    }

    this.settingsService.logoutAllSessions(this.userId).subscribe({
      next: (response) => {
        this.toastService.success(`Successfully logged out of ${response.count} session(s)`);
        this.securitySettings.activeSessions = 1; // Only current session remains
      },
      error: (error) => {
        // Error toast is handled by the service
        console.error('Failed to logout sessions:', error);
      }
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword.update(v => !v);
        break;
      case 'new':
        this.showNewPassword.update(v => !v);
        break;
      case 'confirm':
        this.showConfirmPassword.update(v => !v);
        break;
    }
  }

  /**
   * Get password strength label for display
   */
  getPasswordStrengthLabel(): string {
    const score = this.passwordStrength().score;
    if (score === 0) return '';
    if (score <= 1) return 'Weak';
    if (score <= 2) return 'Fair';
    if (score <= 3) return 'Good';
    return 'Strong';
  }

  /**
   * Get password strength color class
   */
  getPasswordStrengthClass(): string {
    const score = this.passwordStrength().score;
    if (score === 0) return '';
    if (score <= 1) return 'strength-weak';
    if (score <= 2) return 'strength-fair';
    if (score <= 3) return 'strength-good';
    return 'strength-strong';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private focusFirstError(): void {
    // Focus the first invalid field
    const invalidControls = ['currentPassword', 'newPassword', 'confirmPassword'];
    for (const controlName of invalidControls) {
      const control = this.passwordForm.get(controlName);
      if (control?.invalid && control?.touched) {
        const element = this.elementRef.nativeElement.querySelector(`#${controlName}`);
        if (element) {
          element.focus();
          break;
        }
      }
    }
  }

  // Helper methods for template
  get currentPasswordControl() {
    return this.passwordForm.get('currentPassword');
  }

  get newPasswordControl() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.passwordForm.get('confirmPassword');
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.passwordForm.get(controlName);
    return !!(control?.hasError(errorType) && control?.touched);
  }

  hasFormError(errorType: string): boolean {
    return !!(this.passwordForm.hasError(errorType) && 
              this.passwordForm.get('confirmPassword')?.touched);
  }
}
