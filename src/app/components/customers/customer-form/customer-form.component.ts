import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconComponent } from '../../shared/icon/icon.component';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer.model';
import { ToastService } from '../../../services/toast.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <button class="btn btn-ghost mb-2" (click)="goBack()">
            <app-icon name="chevron-left" [size]="20" />
            Back
          </button>
          <h1 class="text-3xl font-semibold" style="color: var(--color-stone-900);">
            {{ isEditMode() ? 'Edit Customer' : 'New Customer' }}
          </h1>
        </div>
      </div>

      <!-- Form Card -->
      <form [formGroup]="customerForm" (ngSubmit)="onSubmit()" class="card">
        <div class="card-body space-y-6">
          <!-- Basic Information -->
          <div>
            <h2 class="text-lg font-semibold mb-4" style="color: var(--color-stone-900);">
              Basic Information
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
                  First Name *
                </label>
                <input
                  type="text"
                  formControlName="firstName"
                  class="input w-full"
                  [class.border-red-500]="isFieldInvalid('firstName')"
                />
                @if (isFieldInvalid('firstName')) {
                  <p class="text-red-600 text-sm mt-1">First name is required</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
                  Last Name *
                </label>
                <input
                  type="text"
                  formControlName="lastName"
                  class="input w-full"
                  [class.border-red-500]="isFieldInvalid('lastName')"
                />
                @if (isFieldInvalid('lastName')) {
                  <p class="text-red-600 text-sm mt-1">Last name is required</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
                  Email
                </label>
                <input
                  type="email"
                  formControlName="email"
                  class="input w-full"
                  [class.border-red-500]="isFieldInvalid('email')"
                />
                @if (isFieldInvalid('email')) {
                  <p class="text-red-600 text-sm mt-1">Valid email is required</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
                  Phone *
                </label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="input w-full"
                  placeholder="(555) 123-4567"
                  [class.border-red-500]="isFieldInvalid('phone')"
                />
                @if (isFieldInvalid('phone')) {
                  <p class="text-red-600 text-sm mt-1">Phone is required</p>
                }
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div>
            <h2 class="text-lg font-semibold mb-4" style="color: var(--color-stone-900);">
              Address
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
                  Street Address
                </label>
                <input
                  type="text"
                  formControlName="address"
                  class="input w-full"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
                    City
                  </label>
                  <input
                    type="text"
                    formControlName="city"
                    class="input w-full"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
                    State
                  </label>
                  <input
                    type="text"
                    formControlName="state"
                    class="input w-full"
                    placeholder="CA"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    formControlName="zipCode"
                    class="input w-full"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Loyalty Program -->
          <div>
            <h2 class="text-lg font-semibold mb-4" style="color: var(--color-stone-900);">
              Loyalty Program
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    formControlName="loyaltyActive"
                    class="w-4 h-4"
                  />
                  <span class="text-sm font-medium" style="color: var(--color-stone-700);">
                    Enroll in Loyalty Program
                  </span>
                </label>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
                  Customer Type
                </label>
                <select formControlName="customerType" class="input w-full">
                  <option value="regular">Regular</option>
                  <option value="vip">VIP</option>
                  <option value="commercial">Commercial</option>
                  <option value="fleet">Fleet</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <div>
            <h2 class="text-lg font-semibold mb-4" style="color: var(--color-stone-900);">
              Preferences
            </h2>
            <div class="space-y-3">
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  formControlName="emailOptIn"
                  class="w-4 h-4"
                />
                <span class="text-sm" style="color: var(--color-stone-700);">
                  Receive email updates and promotions
                </span>
              </label>

              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  formControlName="smsOptIn"
                  class="w-4 h-4"
                />
                <span class="text-sm" style="color: var(--color-stone-700);">
                  Receive SMS notifications
                </span>
              </label>

              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  formControlName="marketingOptIn"
                  class="w-4 h-4"
                />
                <span class="text-sm" style="color: var(--color-stone-700);">
                  Allow marketing communications
                </span>
              </label>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium mb-1" style="color: var(--color-stone-700);">
              Notes
            </label>
            <textarea
              formControlName="notes"
              rows="3"
              class="input w-full"
              placeholder="Additional information about this customer..."
            ></textarea>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="card-body border-t" style="border-color: var(--color-stone-200);">
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="btn btn-ghost"
              (click)="goBack()"
              [disabled]="loadingService.isLoading()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="customerForm.invalid || loadingService.isLoading()"
            >
              @if (loadingService.isLoading()) {
                <span>Saving...</span>
              } @else {
                <span>{{ isEditMode() ? 'Update' : 'Create' }} Customer</span>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-stone-300);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      transition: all 0.15s;
    }

    .input:focus {
      outline: none;
      border-color: var(--color-blue-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .input.border-red-500 {
      border-color: #ef4444;
    }
  `]
})
export class CustomerFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  loadingService = inject(LoadingService);

  isEditMode = signal(false);
  customerId = signal<string | null>(null);

  customerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.email]],
    phone: ['', [Validators.required]],
    address: [''],
    city: [''],
    state: [''],
    zipCode: [''],
    customerType: ['regular'],
    loyaltyActive: [true],
    emailOptIn: [false],
    smsOptIn: [false],
    marketingOptIn: [false],
    notes: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.customerId.set(id);
      this.loadCustomer(id);
    }
  }

  loadCustomer(id: string) {
    this.loadingService.show();
    this.customerService.findOne(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue({
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          zipCode: customer.zipCode || '',
          customerType: customer.customerType || 'regular',
          loyaltyActive: customer.loyaltyActive ?? true,
          emailOptIn: customer.emailOptIn ?? false,
          smsOptIn: customer.smsOptIn ?? false,
          marketingOptIn: customer.marketingOptIn ?? false,
          notes: customer.notes || ''
        });
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load customer');
        console.error('Error loading customer:', error);
        this.loadingService.hide();
        this.goBack();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.customerForm.invalid) {
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.customerForm.value;
    const customerData = {
      ...formValue,
      name: `${formValue.firstName} ${formValue.lastName}`.trim()
    };

    this.loadingService.show();

    const operation = this.isEditMode()
      ? this.customerService.update(this.customerId()!, customerData)
      : this.customerService.create(customerData);

    operation.subscribe({
      next: () => {
        this.toastService.success(
          this.isEditMode() ? 'Customer updated successfully' : 'Customer created successfully'
        );
        this.loadingService.hide();
        this.goBack();
      },
      error: (error) => {
        this.toastService.error(
          this.isEditMode() ? 'Failed to update customer' : 'Failed to create customer'
        );
        console.error('Error saving customer:', error);
        this.loadingService.hide();
      }
    });
  }

  goBack() {
    this.router.navigate(['/customers']);
  }
}
