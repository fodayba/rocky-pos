import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../shared/icon/icon.component';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer.model';
import { ToastService } from '../../../services/toast.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="max-w-6xl mx-auto p-6 space-y-6">
      @if (customer()) {
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <button class="btn btn-ghost mb-2" (click)="goBack()">
              <app-icon name="chevron-left" [size]="20" />
              Back
            </button>
            <div class="flex items-center gap-4">
              <h1 class="text-3xl font-semibold" style="color: var(--color-stone-900);">
                {{ customer()!.name }}
              </h1>
              <span [class]="getTierBadgeClass()">
                {{ customer()!.loyaltyTier || 'Bronze' }}
              </span>
            </div>
          </div>
          <button class="btn btn-primary" (click)="editCustomer()">
            <app-icon name="edit" [size]="20" />
            Edit
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="card">
            <div class="card-body">
              <p class="text-sm" style="color: var(--color-stone-500);">Loyalty Points</p>
              <p class="text-2xl font-semibold mt-1" style="color: var(--color-stone-900);">
                {{ customer()!.loyaltyPoints?.toLocaleString() || 0 }}
              </p>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <p class="text-sm" style="color: var(--color-stone-500);">Total Spent</p>
              <p class="text-2xl font-semibold mt-1" style="color: var(--color-stone-900);">
                {{ customer()!.totalSpent?.toFixed(2) || '0.00' }}
              </p>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <p class="text-sm" style="color: var(--color-stone-500);">Visit Count</p>
              <p class="text-2xl font-semibold mt-1" style="color: var(--color-stone-900);">
                {{ customer()!.visitCount || 0 }}
              </p>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <p class="text-sm" style="color: var(--color-stone-500);">Avg Transaction</p>
              <p class="text-2xl font-semibold mt-1" style="color: var(--color-stone-900);">
                {{ customer()!.averageTransactionValue?.toFixed(2) || '0.00' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Contact Information -->
          <div class="card">
            <div class="card-body">
              <h2 class="text-lg font-semibold mb-4" style="color: var(--color-stone-900);">
                Contact Information
              </h2>
              <div class="space-y-3">
                @if (customer()!.email) {
                  <div class="flex items-start gap-3">
                    <app-icon name="search" [size]="20" customClass="text-stone-400 mt-0.5" />
                    <div>
                      <p class="text-sm" style="color: var(--color-stone-500);">Email</p>
                      <p class="text-sm font-medium" style="color: var(--color-stone-900);">
                        {{ customer()!.email }}
                      </p>
                    </div>
                  </div>
                }
                @if (customer()!.phone) {
                  <div class="flex items-start gap-3">
                    <app-icon name="search" [size]="20" customClass="text-stone-400 mt-0.5" />
                    <div>
                      <p class="text-sm" style="color: var(--color-stone-500);">Phone</p>
                      <p class="text-sm font-medium" style="color: var(--color-stone-900);">
                        {{ customer()!.phone }}
                      </p>
                    </div>
                  </div>
                }
                @if (customer()!.address) {
                  <div class="flex items-start gap-3">
                    <app-icon name="search" [size]="20" customClass="text-stone-400 mt-0.5" />
                    <div>
                      <p class="text-sm" style="color: var(--color-stone-500);">Address</p>
                      <p class="text-sm font-medium" style="color: var(--color-stone-900);">
                        {{ customer()!.address }}
                        @if (customer()!.city || customer()!.state || customer()!.zipCode) {
                          <br>
                          {{ customer()!.city }}{{ customer()!.state ? ', ' + customer()!.state : '' }} {{ customer()!.zipCode }}
                        }
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Loyalty Information -->
          <div class="card">
            <div class="card-body">
              <h2 class="text-lg font-semibold mb-4" style="color: var(--color-stone-900);">
                Loyalty Program
              </h2>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm" style="color: var(--color-stone-500);">Status</span>
                  <span [class]="customer()!.loyaltyActive ? 'badge bg-green-100 text-green-800' : 'badge bg-red-100 text-red-800'">
                    {{ customer()!.loyaltyActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm" style="color: var(--color-stone-500);">Tier</span>
                  <span [class]="getTierBadgeClass()">
                    {{ customer()!.loyaltyTier || 'Bronze' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm" style="color: var(--color-stone-500);">Card Number</span>
                  <span class="text-sm font-medium" style="color: var(--color-stone-900);">
                    {{ customer()!.loyaltyCardNumber || 'N/A' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm" style="color: var(--color-stone-500);">Lifetime Points</span>
                  <span class="text-sm font-medium" style="color: var(--color-stone-900);">
                    {{ customer()!.lifetimePoints?.toLocaleString() || 0 }}
                  </span>
                </div>
              </div>

              @if (customer()!.loyaltyActive) {
                <div class="mt-4 pt-4 border-t" style="border-color: var(--color-stone-200);">
                  <button class="btn btn-sm btn-primary w-full" (click)="redeemPoints()">
                    Redeem Points
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Customer Preferences -->
        @if (customer()!.customerType || customer()!.preferredReceiptMethod) {
          <div class="card">
            <div class="card-body">
              <h2 class="text-lg font-semibold mb-4" style="color: var(--color-stone-900);">
                Preferences & Settings
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                @if (customer()!.customerType) {
                  <div>
                    <p class="text-sm" style="color: var(--color-stone-500);">Customer Type</p>
                    <p class="text-sm font-medium mt-1" style="color: var(--color-stone-900);">
                      {{ customer()!.customerType }}
                    </p>
                  </div>
                }
                @if (customer()!.preferredReceiptMethod) {
                  <div>
                    <p class="text-sm" style="color: var(--color-stone-500);">Receipt Method</p>
                    <p class="text-sm font-medium mt-1" style="color: var(--color-stone-900);">
                      {{ customer()!.preferredReceiptMethod }}
                    </p>
                  </div>
                }
                <div>
                  <p class="text-sm" style="color: var(--color-stone-500);">Marketing Opt-in</p>
                  <div class="flex gap-2 mt-1">
                    @if (customer()!.emailOptIn) {
                      <span class="badge bg-blue-100 text-blue-800">Email</span>
                    }
                    @if (customer()!.smsOptIn) {
                      <span class="badge bg-blue-100 text-blue-800">SMS</span>
                    }
                    @if (!customer()!.emailOptIn && !customer()!.smsOptIn) {
                      <span class="text-sm" style="color: var(--color-stone-500);">None</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Notes -->
        @if (customer()!.notes) {
          <div class="card">
            <div class="card-body">
              <h2 class="text-lg font-semibold mb-2" style="color: var(--color-stone-900);">
                Notes
              </h2>
              <p class="text-sm" style="color: var(--color-stone-600);">
                {{ customer()!.notes }}
              </p>
            </div>
          </div>
        }

        <!-- Activity Summary -->
        <div class="card">
          <div class="card-body">
            <h2 class="text-lg font-semibold mb-4" style="color: var(--color-stone-900);">
              Activity Summary
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm" style="color: var(--color-stone-500);">Last Visit</p>
                <p class="text-sm font-medium mt-1" style="color: var(--color-stone-900);">
                  {{ customer()!.lastVisit ? formatDate(customer()!.lastVisit!) : 'Never' }}
                </p>
              </div>
              <div>
                <p class="text-sm" style="color: var(--color-stone-500);">This Month</p>
                <p class="text-sm font-medium mt-1" style="color: var(--color-stone-900);">
                  {{ customer()!.thisMonthSpent?.toFixed(2) || '0.00' }}
                </p>
              </div>
              <div>
                <p class="text-sm" style="color: var(--color-stone-500);">This Year</p>
                <p class="text-sm font-medium mt-1" style="color: var(--color-stone-900);">
                  {{ customer()!.thisYearSpent?.toFixed(2) || '0.00' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class CustomerDetailsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);

  customer = signal<Customer | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCustomer(id);
    }
  }

  loadCustomer(id: string) {
    this.loadingService.show();
    this.customerService.findOne(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
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

  getTierBadgeClass(): string {
    const tier = this.customer()?.loyaltyTier || 'bronze';
    const classes: Record<string, string> = {
      platinum: 'badge bg-purple-100 text-purple-800',
      gold: 'badge bg-yellow-100 text-yellow-800',
      silver: 'badge bg-gray-100 text-gray-800',
      bronze: 'badge bg-orange-100 text-orange-800',
    };
    return classes[tier] || classes['bronze'];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  editCustomer() {
    this.router.navigate(['/customers/edit', this.customer()?._id]);
  }

  redeemPoints() {
    this.toastService.info('Points redemption feature coming soon');
  }

  goBack() {
    this.router.navigate(['/customers']);
  }
}
