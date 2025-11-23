import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { LocationService } from '../../services/location.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { Location, LocationStatus, LocationStatistics } from '../../models/location.model';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DataTableComponent],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.css'
})
export class LocationsComponent implements OnInit {
  private locationService = inject(LocationService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  locations = signal<Location[]>([]);
  statistics = signal<LocationStatistics | null>(null);
  searchQuery = signal('');
  selectedStatus = signal<string>('all');

  filteredLocations = computed(() => {
    let filtered = this.locations();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(loc =>
        loc.locationCode.toLowerCase().includes(query) ||
        loc.name.toLowerCase().includes(query) ||
        loc.address.city.toLowerCase().includes(query) ||
        loc.address.state.toLowerCase().includes(query)
      );
    }

    const status = this.selectedStatus();
    if (status !== 'all') {
      filtered = filtered.filter(loc => loc.status === status);
    }

    return filtered;
  });

  columns: TableColumn<Location>[] = [
    {
      key: 'locationCode',
      label: 'Code',
      sortable: true,
      render: (row) => {
        return `<span class="font-semibold">${row.locationCode}</span>`;
      }
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
        const label = row.type.replace(/_/g, ' ').toUpperCase();
        return `<span class="text-stone-700">${label}</span>`;
      }
    },
    {
      key: 'address',
      label: 'Location',
      sortable: false,
      render: (row) => {
        return `${row.address.city}, ${row.address.state}`;
      }
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false
    },
    {
      key: 'totalEmployees',
      label: 'Employees',
      sortable: true,
      render: (row) => {
        return `<span class="text-stone-700">${row.activeEmployees} / ${row.totalEmployees}</span>`;
      }
    },
    {
      key: 'hasFuel',
      label: 'Services',
      sortable: false,
      render: (row) => {
        const services = [];
        if (row.hasFuel) services.push('Fuel');
        if (row.hasConvenienceStore) services.push('Store');
        if (row.hasCarWash) services.push('Wash');
        return services.length > 0 ? services.join(', ') : '<span class="text-stone-400">None</span>';
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
          temporarily_closed: 'bg-orange-100 text-orange-800',
          under_maintenance: 'bg-yellow-100 text-yellow-800'
        };
        const color = statusColors[row.status] || 'bg-gray-100 text-gray-800';
        const label = row.status.replace(/_/g, ' ').toUpperCase();
        return `<span class="badge ${color}">${label}</span>`;
      }
    }
  ];

  actions: TableAction<Location>[] = [
    {
      label: 'View Details',
      icon: 'search',
      onClick: (location) => this.viewDetails(location._id)
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (location) => this.editLocation(location._id)
    },
    {
      label: 'Deactivate',
      icon: 'x',
      onClick: (location) => this.deactivateLocation(location),
      show: (location) => location.status === LocationStatus.ACTIVE
    },
    {
      label: 'Activate',
      icon: 'check',
      onClick: (location) => this.activateLocation(location),
      show: (location) => location.status === LocationStatus.INACTIVE
    }
  ];

  ngOnInit() {
    this.loadLocations();
    this.loadStatistics();
  }

  loadLocations() {
    this.loadingService.show();
    this.locationService.findAll().subscribe({
      next: (locations) => {
        this.locations.set(locations);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load locations');
        console.error('Error loading locations:', error);
        this.loadingService.hide();
      }
    });
  }

  loadStatistics() {
    this.locationService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  viewDetails(id: string) {
    this.router.navigate(['/locations', id]);
  }

  editLocation(id: string) {
    this.router.navigate(['/locations/edit', id]);
  }

  deactivateLocation(location: Location) {
    if (!confirm(`Deactivate location ${location.name}?`)) return;

    this.loadingService.show();
    this.locationService.deactivate(location._id).subscribe({
      next: () => {
        this.toastService.success('Location deactivated');
        this.loadLocations();
      },
      error: (error) => {
        this.toastService.error('Failed to deactivate location');
        console.error('Error deactivating location:', error);
        this.loadingService.hide();
      }
    });
  }

  activateLocation(location: Location) {
    if (!confirm(`Activate location ${location.name}?`)) return;

    this.loadingService.show();
    this.locationService.activate(location._id).subscribe({
      next: () => {
        this.toastService.success('Location activated');
        this.loadLocations();
      },
      error: (error) => {
        this.toastService.error('Failed to activate location');
        console.error('Error activating location:', error);
        this.loadingService.hide();
      }
    });
  }

  createLocation() {
    this.router.navigate(['/locations/create']);
  }

  updateSearch(value: string) {
    this.searchQuery.set(value);
  }

  updateStatusFilter(value: string) {
    this.selectedStatus.set(value);
  }
}
