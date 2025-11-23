import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { FleetAccountService } from '../../services/fleet-account.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { FleetAccount, FleetAccountStatus, FleetAccountStatistics } from '../../models/fleet-account.model';

@Component({
  selector: 'app-fleet-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DataTableComponent],
  templateUrl: './fleet-accounts.component.html',
  styleUrl: './fleet-accounts.component.css'
})
export class FleetAccountsComponent implements OnInit {
  private fleetAccountService = inject(FleetAccountService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  fleetAccounts = signal<FleetAccount[]>([]);
  statistics = signal<FleetAccountStatistics | null>(null);
  searchQuery = signal('');
  selectedStatus = signal<string>('all');

  filteredFleetAccounts = computed(() => {
    let filtered = this.fleetAccounts();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(fa =>
        fa.accountNumber.toLowerCase().includes(query) ||
        fa.companyName.toLowerCase().includes(query) ||
        fa.contactName.toLowerCase().includes(query)
      );
    }

    const status = this.selectedStatus();
    if (status !== 'all') {
      filtered = filtered.filter(fa => fa.status === status);
    }

    return filtered;
  });

  columns: TableColumn<FleetAccount>[] = [
    {
      key: 'accountNumber',
      label: 'Account #',
      sortable: true,
      render: (row) => {
        return `<span class="font-semibold">${row.accountNumber}</span>`;
      }
    },
    {
      key: 'companyName',
      label: 'Company',
      sortable: true
    },
    {
      key: 'contactName',
      label: 'Contact',
      sortable: true
    },
    {
      key: 'totalCards',
      label: 'Cards',
      sortable: true,
      render: (row) => {
        return `<span class="text-stone-700">${row.activeCards} / ${row.totalCards}</span>`;
      }
    },
    {
      key: 'currentBalance',
      label: 'Balance',
      sortable: true,
      render: (row) => {
        const color = row.currentBalance > 0 ? 'text-red-600' : 'text-green-600';
        return `<span class="${color} font-semibold">$${Math.abs(row.currentBalance).toFixed(2)}</span>`;
      }
    },
    {
      key: 'creditLimit',
      label: 'Credit Limit',
      sortable: true,
      render: (row) => {
        return `<span class="text-stone-700">$${row.creditLimit.toFixed(2)}</span>`;
      }
    },
    {
      key: 'monthlySpend',
      label: 'Monthly Spend',
      sortable: true,
      render: (row) => {
        return `<span class="font-semibold">$${row.monthlySpend.toFixed(2)}</span>`;
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const statusColors: Record<string, string> = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          suspended: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800'
        };
        const color = statusColors[row.status] || 'bg-gray-100 text-gray-800';
        return `<span class="badge ${color}">${row.status.toUpperCase()}</span>`;
      }
    }
  ];

  actions: TableAction<FleetAccount>[] = [
    {
      label: 'View Details',
      icon: 'search',
      onClick: (account) => this.viewDetails(account._id)
    },
    {
      label: 'Issue Card',
      icon: 'credit-card',
      onClick: (account) => this.issueCard(account),
      show: (account) => account.status === FleetAccountStatus.ACTIVE
    },
    {
      label: 'Record Payment',
      icon: 'dollar',
      onClick: (account) => this.recordPayment(account),
      show: (account) => account.currentBalance > 0
    },
    {
      label: 'Suspend',
      icon: 'x',
      onClick: (account) => this.suspendAccount(account),
      show: (account) => account.status === FleetAccountStatus.ACTIVE
    },
    {
      label: 'Activate',
      icon: 'check',
      onClick: (account) => this.activateAccount(account),
      show: (account) => account.status === FleetAccountStatus.INACTIVE || account.status === FleetAccountStatus.SUSPENDED
    }
  ];

  ngOnInit() {
    this.loadFleetAccounts();
    this.loadStatistics();
  }

  loadFleetAccounts() {
    this.loadingService.show();
    this.fleetAccountService.findAll().subscribe({
      next: (accounts) => {
        this.fleetAccounts.set(accounts);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load fleet accounts');
        console.error('Error loading fleet accounts:', error);
        this.loadingService.hide();
      }
    });
  }

  loadStatistics() {
    this.fleetAccountService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  viewDetails(id: string) {
    this.router.navigate(['/fleet-accounts', id]);
  }

  issueCard(account: FleetAccount) {
    this.toastService.info('Issue card functionality - navigate to detail page');
    this.viewDetails(account._id);
  }

  recordPayment(account: FleetAccount) {
    const amount = prompt(`Enter payment amount for ${account.companyName}:`);
    if (!amount || isNaN(parseFloat(amount))) return;

    this.loadingService.show();
    this.fleetAccountService.recordPayment(account._id, parseFloat(amount), 'check').subscribe({
      next: () => {
        this.toastService.success('Payment recorded successfully');
        this.loadFleetAccounts();
      },
      error: (error) => {
        this.toastService.error('Failed to record payment');
        console.error('Error recording payment:', error);
        this.loadingService.hide();
      }
    });
  }

  suspendAccount(account: FleetAccount) {
    const reason = prompt(`Enter reason for suspending ${account.companyName}:`);
    if (!reason) return;

    this.loadingService.show();
    this.fleetAccountService.suspend(account._id, reason).subscribe({
      next: () => {
        this.toastService.success('Fleet account suspended');
        this.loadFleetAccounts();
      },
      error: (error) => {
        this.toastService.error('Failed to suspend fleet account');
        console.error('Error suspending account:', error);
        this.loadingService.hide();
      }
    });
  }

  activateAccount(account: FleetAccount) {
    if (!confirm(`Activate fleet account for ${account.companyName}?`)) return;

    this.loadingService.show();
    this.fleetAccountService.activate(account._id).subscribe({
      next: () => {
        this.toastService.success('Fleet account activated');
        this.loadFleetAccounts();
      },
      error: (error) => {
        this.toastService.error('Failed to activate fleet account');
        console.error('Error activating account:', error);
        this.loadingService.hide();
      }
    });
  }

  createFleetAccount() {
    this.router.navigate(['/fleet-accounts/create']);
  }

  updateSearch(value: string) {
    this.searchQuery.set(value);
  }

  updateStatusFilter(value: string) {
    this.selectedStatus.set(value);
  }
}
