import { Component, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OnboardingService, CreateLocationDto } from '../../../services/onboarding.service';
import { ToastService } from '../../../services/toast.service';

export enum StoreFormat {
  FULL_SERVICE = 'full_service',
  EXPRESS = 'express',
  FUEL_ONLY = 'fuel_only',
  TRUCK_STOP = 'truck_stop',
  MINI_MART = 'mini_mart'
}

@Component({
  selector: 'app-location-setup-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './location-setup-step.component.html',
  styleUrls: ['./location-setup-step.component.css']
})
export class LocationSetupStepComponent implements OnInit {
  @Output() complete = new EventEmitter<any>();
  @Output() dataChange = new EventEmitter<any>();
  @Output() loadingChange = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private onboardingService = inject(OnboardingService);
  private toastService = inject(ToastService);

  locationForm!: FormGroup;
  isSubmitting = signal(false);
  storeNumberManual = signal(false);

  storeFormats = [
    { value: StoreFormat.FULL_SERVICE, label: 'Full Service (Gas + Large C-Store)', icon: '🏪' },
    { value: StoreFormat.EXPRESS, label: 'Express (Gas + Small C-Store)', icon: '⚡' },
    { value: StoreFormat.FUEL_ONLY, label: 'Fuel Only', icon: '⛽' },
    { value: StoreFormat.TRUCK_STOP, label: 'Truck Stop', icon: '🚛' },
    { value: StoreFormat.MINI_MART, label: 'Mini Mart (C-Store Only)', icon: '🏬' }
  ];

  usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.generateStoreNumber();
  }

  private initializeForm(): void {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      storeNumber: ['', [Validators.required]],
      storeFormat: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\-\(\)]+$/)]],
      country: ['USA'],
      timezone: [this.detectTimezone()]
    });

    // Emit data changes
    this.locationForm.valueChanges.subscribe(() => {
      if (this.locationForm.valid) {
        this.dataChange.emit(this.locationForm.value);
      } else {
        this.dataChange.emit(null);
      }
    });
  }

  private generateStoreNumber(): void {
    // Generate a simple store number based on timestamp
    const timestamp = Date.now().toString().slice(-6);
    const storeNumber = `STORE-${timestamp}`;
    this.locationForm.patchValue({ storeNumber });
  }

  private detectTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
    } catch {
      return 'America/New_York';
    }
  }

  toggleStoreNumberManual(): void {
    this.storeNumberManual.set(!this.storeNumberManual());
    if (!this.storeNumberManual()) {
      this.generateStoreNumber();
    }
  }

  onSubmit(): void {
    if (this.locationForm.invalid) {
      this.markFormGroupTouched(this.locationForm);
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting.set(true);
    this.loadingChange.emit(true);

    // Preserve form data before submission
    const locationData: CreateLocationDto = this.locationForm.value;

    this.onboardingService.createLocation(locationData).subscribe({
      next: (location) => {
        this.toastService.success('Location created successfully!');
        
        // Mark location setup as complete
        this.onboardingService.updateProgress('locationSetup').subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.loadingChange.emit(false);
            this.complete.emit(location);
          },
          error: (error) => {
            console.error('Error updating progress:', error);
            // Still complete even if progress update fails
            this.isSubmitting.set(false);
            this.loadingChange.emit(false);
            this.complete.emit(location);
          }
        });
      },
      error: (error) => {
        // Reset loading state but preserve form data
        this.isSubmitting.set(false);
        this.loadingChange.emit(false);
        
        // Form data is automatically preserved since we don't reset the form
        // The error toast is already shown by the service
        
        // If it's a duplicate store number error, focus on the store number field
        if (error.message && error.message.includes('Store number already exists')) {
          const storeNumberField = this.locationForm.get('storeNumber');
          storeNumberField?.markAsTouched();
          storeNumberField?.setErrors({ duplicate: true });
        }
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.locationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.locationForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['minLength']) return `Minimum length is ${field.errors['minLength'].requiredLength}`;
    if (field.errors['duplicate']) return 'This store number already exists. Please choose a different one.';
    if (field.errors['pattern']) {
      if (fieldName === 'zipCode') return 'Invalid ZIP code format (e.g., 12345 or 12345-6789)';
      if (fieldName === 'phone') return 'Invalid phone number format';
    }
    return 'Invalid value';
  }
}
