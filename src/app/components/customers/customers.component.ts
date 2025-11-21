import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '../shared/icon/icon.component';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, IconComponent, DataTableComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-6 p-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold" style="color: var(--color-stone-900);">
            Customers
          </h1>
          <p class="text-sm mt-1" style="color: var(--color-stone-500);">
            Manage customer profiles and loyalty program
          </p>
        </div>
        <button class="btn btn-primary" (click)="createCustomer()">
          <app-icon name="plus" [size]="20" />
          Add Customer
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm" style="color: var(--color-stone-500);">Total Customers</p>
                <p class="text-2xl font-semibold mt-1" style="color: var(--color-stone-900);">
                  {{ stats().total }}
                </p>
              </div>
              <div class="p-3 rounded-lg" style="background: var(--color-blue-50);">
                <app-icon name="users" [size]="24" customClass="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm" style="color: var(--color-stone-500);">Active Members</p>
                <p class="text-2xl font-semibold mt-1" style="color: var(--color-stone-900);">
                  {{ stats().active }}
                </p>
              </div>
              <div class="p-3 rounded-lg" style="background: var(--color-green-50);">
                <app-icon name="check" [size]="24" customClass="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm" style="color: var(--color-stone-500);">VIP Members</p>
                <p class="text-2xl font-semibold mt-1" style="color: var(--color-stone-900);">
                  {{ stats().vip }}
                </p>
              </div>
              <div class="p-3 rounded-lg" style="background: var(--color-purple-50);">
                <app-icon name="users" [size]="24" customClass="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm" style="color: var(--color-stone-500);">Avg Loyalty Points</p>
                <p class="text-2xl font-semibold mt-1" style="color: var(--color-stone-900);">
                  {{ stats().avgPoints }}
                </p>
              </div>
              <div class="p-3 rounded-lg" style="background: var(--color-yellow-50);">
                <app-icon name="dollar" [size]="24" customClass="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Table -->
      <app-data-table
        [data]="customerService.customers()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loadingService.isLoading()"
        [searchable]="true"
        [paginated]="true"
        [pageSize]="10"
        emptyMessage="No customers found"
        (rowClicked)="viewCustomer($event)"
      />
    </div>
  `,
  styles: []
})
export class CustomersComponent implements OnInit {
  private router = inject(Router);
  customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  loadingService = inject(LoadingService);

  stats = signal({
    total: 0,
    active: 0,
    vip: 0,
    avgPoints: 0
  });

  columns: TableColumn<Customer>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'loyaltyTier',
      label: 'Tier',
      render: (row) => {
        const tierColors: Record<string, string> = {
          platinum: 'bg-purple-100 text-purple-800',
          gold: 'bg-yellow-100 text-yellow-800',
          silver: 'bg-gray-100 text-gray-800',
          bronze: 'bg-orange-100 text-orange-800',
        };
        const color = tierColors[row.loyaltyTier || 'bronze'];
        return `<span class="badge ${color}">${row.loyaltyTier || 'Bronze'}</span>`;
      },
    },
    {
      key: 'loyaltyPoints',
      label: 'Points',
      sortable: true,
      align: 'right',
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      align: 'right',
      render: (row) => `$${row.totalSpent?.toFixed(2) || '0.00'}`,
    },
    {
      key: 'loyaltyActive',
      label: 'Status',
      render: (row) => {
        const color = row.loyaltyActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        return `<span class="badge ${color}">${row.loyaltyActive ? 'Active' : 'Inactive'}</span>`;
      },
    },
  ];

  actions: TableAction<Customer>[] = [
    {
      label: 'View',
      icon: 'search',
      onClick: (customer) => this.viewCustomer(customer),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (customer) => this.editCustomer(customer),
    },
  ];

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loadingService.show();
    this.customerService.findAll().subscribe({
      next: () => {
        this.calculateStats();
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load customers');
        console.error('Error loading customers:', error);
        this.loadingService.hide();
      }
    });
  }

  calculateStats() {
    const customers = this.customerService.customers();
    const active = customers.filter((c) => c.loyaltyActive).length;
    const vip = customers.filter((c) => c.loyaltyTier === 'platinum' || c.loyaltyTier === 'gold').length;
    const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
    const avgPoints = customers.length > 0 ? Math.round(totalPoints / customers.length) : 0;

    this.stats.set({
      total: customers.length,
      active,
      vip,
      avgPoints,
    });
  }

  createCustomer() {
    this.router.navigate(['/customers/add']);
  }

  viewCustomer(customer: Customer) {
    this.router.navigate(['/customers', customer._id]);
  }

  editCustomer(customer: Customer) {
    this.router.navigate(['/customers/edit', customer._id]);
  }
}
