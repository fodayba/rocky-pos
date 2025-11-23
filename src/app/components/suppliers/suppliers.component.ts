import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { SupplierService } from '../../services/supplier.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { Supplier, SupplierType, SupplierStatistics } from '../../models/supplier.model';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DataTableComponent],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css'
})
export class SuppliersComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  suppliers = signal<Supplier[]>([]);
  statistics = signal<SupplierStatistics | null>(null);
  searchQuery = signal('');
  selectedType = signal<string>('all');
  selectedStatus = signal<string>('all');

  filteredSuppliers = computed(() => {
    let filtered = this.suppliers();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.supplierCode.toLowerCase().includes(query) ||
        s.contactPerson.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
      );
    }

    const type = this.selectedType();
    if (type !== 'all') {
      filtered = filtered.filter(s => s.type === type);
    }

    const status = this.selectedStatus();
    if (status === 'active') {
      filtered = filtered.filter(s => s.active);
    } else if (status === 'inactive') {
      filtered = filtered.filter(s => !s.active);
    } else if (status === 'preferred') {
      filtered = filtered.filter(s => s.preferred);
    }

    return filtered;
  });

  columns: TableColumn<Supplier>[] = [
    {
      key: 'supplierCode',
      label: 'Code',
      sortable: true
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row) => {
        const typeColors: Record<string, string> = {
          fuel: 'bg-blue-100 text-blue-800',
          merchandise: 'bg-green-100 text-green-800',
          both: 'bg-purple-100 text-purple-800',
          service: 'bg-orange-100 text-orange-800'
        };
        const color = typeColors[row.type] || 'bg-gray-100 text-gray-800';
        return `<span class="badge ${color}">${row.type}</span>`;
      }
    },
    {
      key: 'contactPerson',
      label: 'Contact',
      sortable: true
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false
    },
    {
      key: 'currentBalance',
      label: 'Balance',
      sortable: true,
      render: (row) => {
        const color = row.currentBalance > 0 ? 'text-red-600' : 'text-stone-700';
        return `<span class="${color}">$${row.currentBalance.toFixed(2)}</span>`;
      }
    },
    {
      key: 'onTimeDeliveryRate',
      label: 'On-Time %',
      sortable: true,
      render: (row) => {
        const rate = row.onTimeDeliveryRate;
        let color = 'text-green-600';
        if (rate < 80) color = 'text-red-600';
        else if (rate < 90) color = 'text-orange-600';
        return `<span class="${color} font-semibold">${rate}%</span>`;
      }
    },
    {
      key: 'active',
      label: 'Status',
      sortable: true,
      render: (row) => {
        if (row.preferred) {
          return '<span class="badge bg-yellow-100 text-yellow-800">Preferred</span>';
        }
        return row.active
          ? '<span class="badge bg-green-100 text-green-800">Active</span>'
          : '<span class="badge bg-gray-100 text-gray-800">Inactive</span>';
      }
    }
  ];

  actions: TableAction<Supplier>[] = [
    {
      label: 'View Details',
      icon: 'search',
      onClick: (supplier) => this.viewDetails(supplier._id)
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (supplier) => this.editSupplier(supplier._id)
    },
    {
      label: 'Delete',
      icon: 'trash',
      onClick: (supplier) => this.deleteSupplier(supplier)
    }
  ];

  ngOnInit() {
    this.loadSuppliers();
    this.loadStatistics();
  }

  loadSuppliers() {
    this.loadingService.show();
    this.supplierService.findAll().subscribe({
      next: (suppliers) => {
        this.suppliers.set(suppliers);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load suppliers');
        console.error('Error loading suppliers:', error);
        this.loadingService.hide();
      }
    });
  }

  loadStatistics() {
    this.supplierService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  viewDetails(id: string) {
    this.router.navigate(['/suppliers', id]);
  }

  editSupplier(id: string) {
    this.router.navigate(['/suppliers/edit', id]);
  }

  deleteSupplier(supplier: Supplier) {
    if (confirm(`Are you sure you want to delete supplier "${supplier.name}"?`)) {
      this.loadingService.show();
      this.supplierService.remove(supplier._id).subscribe({
        next: () => {
          this.toastService.success('Supplier deleted successfully');
          this.loadSuppliers();
        },
        error: (error) => {
          this.toastService.error('Failed to delete supplier');
          console.error('Error deleting supplier:', error);
          this.loadingService.hide();
        }
      });
    }
  }

  addSupplier() {
    this.router.navigate(['/suppliers/add']);
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
}
