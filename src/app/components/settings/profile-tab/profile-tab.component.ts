import { Component, OnInit, Input, Output, EventEmitter, signal, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService, UserProfile } from '../../../services/settings.service';
import { ToastService } from '../../../services/toast.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-profile-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, IconComponent],
  templateUrl: './profile-tab.component.html',
  styleUrl: './profile-tab.component.css'
})
export class ProfileTabComponent implements OnInit {
  @Input() userProfile!: UserProfile;
  @Input() userId!: string;
  @Output() unsavedChanges = new EventEmitter<boolean>();
  @Output() profileUpdated = new EventEmitter<UserProfile>();

  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private toastService = inject(ToastService);
  private elementRef = inject(ElementRef);

  profileForm!: FormGroup;
  isEditing = signal(false);
  isSaving = signal(false);
  originalFormValue: any = null;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      fullName: [this.userProfile.fullName, [Validators.required]],
      email: [this.userProfile.email, [Validators.required, Validators.email]],
      phone: [this.userProfile.phone || '']
    });

    // Store original values for cancel operation
    this.originalFormValue = this.profileForm.value;

    // Disable form initially (read-only mode)
    this.profileForm.disable();

    // Track form changes
    this.profileForm.valueChanges.subscribe(() => {
      if (this.isEditing()) {
        const hasChanges = JSON.stringify(this.profileForm.value) !== JSON.stringify(this.originalFormValue);
        this.unsavedChanges.emit(hasChanges);
      }
    });
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      // Cancel edit mode
      this.cancelEdit();
    } else {
      // Enter edit mode
      this.isEditing.set(true);
      this.profileForm.enable();
      // Keep role and createdAt read-only
      this.profileForm.get('role')?.disable();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.focusFirstError();
      return;
    }

    this.isSaving.set(true);
    const updatedProfile = this.profileForm.getRawValue();

    this.settingsService.updateProfile(this.userId, updatedProfile).subscribe({
      next: (profile) => {
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.profileForm.disable();
        this.originalFormValue = this.profileForm.value;
        this.unsavedChanges.emit(false);
        this.profileUpdated.emit(profile);
        this.toastService.success('Profile updated successfully');
      },
      error: (error) => {
        this.isSaving.set(false);
        // Error toast is handled by the service
        console.error('Failed to update profile:', error);
      }
    });
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.profileForm.patchValue(this.originalFormValue);
    this.profileForm.disable();
    this.unsavedChanges.emit(false);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private focusFirstError(): void {
    // Focus the first invalid field
    const invalidControls = ['fullName', 'email', 'phone'];
    for (const controlName of invalidControls) {
      const control = this.profileForm.get(controlName);
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
  get fullNameControl() {
    return this.profileForm.get('fullName');
  }

  get emailControl() {
    return this.profileForm.get('email');
  }

  get phoneControl() {
    return this.profileForm.get('phone');
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control?.hasError(errorType) && control?.touched);
  }
}
