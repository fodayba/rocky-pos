import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { IconComponent } from '../shared/icon/icon.component';
import { TaxService } from '../../services/tax.service';
import { TaxRate, TaxType, TaxStatistics } from '../../models/tax.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-tax-management',
  standalone: true,
  imports: [CommonModule, DataTableComponent, IconComponent],
  templateUrl: './tax-management.component.html',
  styleUrls: ['./tax-management.component.css'],
})
export class TaxManagementComponent implements OnInit {
  private taxService = inject(TaxService);
  private toastService = inject(ToastService);

  taxRates = this.taxService.taxRates;
  statistics = signal<TaxStatistics | null>(null);
  searchQuery = signal('');
  selectedType = signal<string>('all');
  selectedStatus = signal<string>('all');

  filteredTaxRates = computed(() => {
    let rates = this.taxRates();
    const query = this.searchQuery().toLowerCase();
    const type = this.selectedType();
    const status = this.selectedStatus();

    if (query) {
      rates = rates.filter(
        (rate) =>
          rate.name.toLowerCase().includes(query) ||
          rate.description?.toLowerCase().includes(query) ||
          rate.locationName?.toLowerCase().includes(query)
      );
    }

    if (type !== 'all') {
      rates = rates.filter((rate) => rate.type === type);
    }

    if (status === 'active') {
      rates = rates.filter((rate) => rate.active);
    } else if (status === 'inactive') {
      rates = rates.filter((rate) => !rate.active);
    }

    return rates;
  });

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row: TaxRate) => this.formatTaxType(row.type),
    },
    {
      key: 'rate',
      label: 'Rate',
      sortable: true,
      render: (row: TaxRate) => `${(row.rate * 100).toFixed(2)}%`,
    },
    {
      key: 'locationName',
      label: 'Location',
      sortable: true,
      render: (row: TaxRate) => row.locationName || 'All Locations',
    },
    {
      key: 'isDefault',
      label: 'Default',
      render: (row: TaxRate) =>
        row.isDefault
          ? `<span class="badge" style="background-color: var(--color-blue-100); color: var(--color-blue-700);">Default</span>`
          : '',
    },
    {
      key: 'active',
      label: 'Status',
      sortable: true,
      render: (row: TaxRate) =>
        row.active
          ? `<span class="badge" style="background-color: var(--color-green-100); color: var(--color-green-700);">Active</span>`
          : `<span class="badge" style="background-color: var(--color-stone-200); color: var(--color-stone-700);">Inactive</span>`,
    },
    {
      key: 'effectiveDate',
      label: 'Effective Date',
      sortable: true,
      render: (row: TaxRate) =>
        new Date(row.effectiveDate).toLocaleDateString(),
    },
  ];

  actions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (row: TaxRate) => this.editTaxRate(row),
    },
    {
      label: 'Activate',
      icon: 'check',
      onClick: (row: TaxRate) => this.activateTaxRate(row._id),
      show: (row: TaxRate) => !row.active,
    },
    {
      label: 'Deactivate',
      icon: 'x',
      onClick: (row: TaxRate) => this.deactivateTaxRate(row._id),
      show: (row: TaxRate) => row.active,
    },
    {
      label: 'Delete',
      icon: 'trash',
      onClick: (row: TaxRate) => this.deleteTaxRate(row._id),
      class: 'btn-danger',
    },
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.taxService.findAll().subscribe({
      next: () => {},
      error: (error) => {
        console.error('Failed to load tax rates:', error);
        this.toastService.error('Failed to load tax rates');
      },
    });

    this.taxService.getStatistics().subscribe({
      next: (stats) => this.statistics.set(stats),
      error: (error) => {
        console.error('Failed to load statistics:', error);
      },
    });
  }

  createTaxRate() {
    this.toastService.info('Create tax rate dialog would open here');
  }

  editTaxRate(taxRate: TaxRate) {
    this.toastService.info(`Edit tax rate: ${taxRate.name}`);
  }

  activateTaxRate(id: string) {
    this.taxService.activate(id).subscribe({
      next: () => {
        this.toastService.success('Tax rate activated successfully');
      },
      error: (error) => {
        console.error('Failed to activate tax rate:', error);
        this.toastService.error('Failed to activate tax rate');
      },
    });
  }

  deactivateTaxRate(id: string) {
    this.taxService.deactivate(id).subscribe({
      next: () => {
        this.toastService.success('Tax rate deactivated successfully');
      },
      error: (error) => {
        console.error('Failed to deactivate tax rate:', error);
        this.toastService.error('Failed to deactivate tax rate');
      },
    });
  }

  deleteTaxRate(id: string) {
    if (confirm('Are you sure you want to delete this tax rate?')) {
      this.taxService.remove(id).subscribe({
        next: () => {
          this.toastService.success('Tax rate deleted successfully');
        },
        error: (error) => {
          console.error('Failed to delete tax rate:', error);
          this.toastService.error('Failed to delete tax rate');
        },
      });
    }
  }

  updateSearch(value: string) {
    this.searchQuery.set(value);
  }

  updateTypeFilter(value: string) {
    this.selectedType.set(value);
  }

  updateStatusFilter(value: string) {
    this.selectedStatus.set(value);
  }

  private formatTaxType(type: TaxType): string {
    const typeMap: Record<TaxType, string> = {
      [TaxType.SALES_TAX]: 'Sales Tax',
      [TaxType.FUEL_TAX]: 'Fuel Tax',
      [TaxType.EXCISE_TAX]: 'Excise Tax',
      [TaxType.VAT]: 'VAT',
    };
    return typeMap[type] || type;
  }
}
