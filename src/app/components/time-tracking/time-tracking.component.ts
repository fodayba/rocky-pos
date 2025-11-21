import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { TimeTrackingService } from '../../services/time-tracking.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { AuthService } from '../../services/auth.service';
import { TimeEntry, TimeEntryStatus } from '../../models/time-entry.model';

@Component({
  selector: 'app-time-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DataTableComponent],
  templateUrl: './time-tracking.component.html',
  styleUrl: './time-tracking.component.css'
})
export class TimeTrackingComponent implements OnInit, OnDestroy {
  private timeTrackingService = inject(TimeTrackingService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);
  private router = inject(Router);

  entries = signal<TimeEntry[]>([]);
  activeEntry = signal<TimeEntry | null>(null);
  currentDuration = signal<string>('00:00:00');
  searchQuery = signal('');
  selectedStatus = signal<string>('all');
  isManager = signal(false);

  private durationInterval?: number;

  filteredEntries = computed(() => {
    let filtered = this.entries();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(e =>
        e.employeeName.toLowerCase().includes(query) ||
        e.status.toLowerCase().includes(query)
      );
    }

    const status = this.selectedStatus();
    if (status !== 'all') {
      filtered = filtered.filter(e => e.status === status);
    }

    return filtered;
  });

  columns: TableColumn<TimeEntry>[] = [
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true
    },
    {
      key: 'clockIn',
      label: 'Clock In',
      sortable: true,
      render: (row) => {
        const date = new Date(row.clockIn);
        return date.toLocaleString();
      }
    },
    {
      key: 'clockOut',
      label: 'Clock Out',
      sortable: true,
      render: (row) => {
        if (!row.clockOut) return '<span class="text-stone-500">Active</span>';
        const date = new Date(row.clockOut);
        return date.toLocaleString();
      }
    },
    {
      key: 'totalHours',
      label: 'Hours',
      sortable: true,
      render: (row) => {
        if (!row.totalHours) return '<span class="text-stone-500">-</span>';
        return `<span class="font-semibold">${row.totalHours.toFixed(2)}</span>`;
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const statusColors: Record<string, string> = {
          active: 'bg-blue-100 text-blue-800',
          completed: 'bg-green-100 text-green-800',
          approved: 'bg-purple-100 text-purple-800',
          disputed: 'bg-red-100 text-red-800'
        };
        const color = statusColors[row.status] || 'bg-gray-100 text-gray-800';
        return `<span class="badge ${color}">${row.status.toUpperCase()}</span>`;
      }
    }
  ];

  actions: TableAction<TimeEntry>[] = [
    {
      label: 'Approve',
      icon: 'check',
      onClick: (entry) => this.approveEntry(entry._id),
      show: (entry) => this.isManager() && entry.status === TimeEntryStatus.COMPLETED
    },
    {
      label: 'Adjust',
      icon: 'edit',
      onClick: (entry) => this.adjustEntry(entry),
      show: (entry) => this.isManager()
    }
  ];

  ngOnInit() {
    this.checkUserRole();
    this.loadActiveEntry();
    this.loadEntries();
    this.startDurationTimer();
  }

  ngOnDestroy() {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
    }
  }

  checkUserRole() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.isManager.set(currentUser.role === 'admin' || currentUser.role === 'manager');
    }
  }

  loadActiveEntry() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this.timeTrackingService.getActiveEntry(currentUser.id).subscribe({
      next: (entry) => {
        this.activeEntry.set(entry);
      },
      error: (error) => {
        console.error('Error loading active entry:', error);
      }
    });
  }

  loadEntries() {
    this.loadingService.show();
    const filters = this.isManager() ? {} : undefined;

    const request = this.isManager()
      ? this.timeTrackingService.getAllEntries(filters)
      : this.timeTrackingService.getMyEntries();

    request.subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load time entries');
        console.error('Error loading entries:', error);
        this.loadingService.hide();
      }
    });
  }

  clockIn() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.toastService.error('User not authenticated');
      return;
    }

    this.loadingService.show();
    this.timeTrackingService.clockIn({
      employeeId: currentUser.id,
      locationId: 'default', // TODO: Get actual location from user settings or store
      clockInMethod: 'web'
    }).subscribe({
      next: (entry) => {
        this.activeEntry.set(entry);
        this.toastService.success('Clocked in successfully');
        this.loadEntries();
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to clock in');
        console.error('Error clocking in:', error);
        this.loadingService.hide();
      }
    });
  }

  clockOut() {
    const entry = this.activeEntry();
    if (!entry) return;

    this.loadingService.show();
    this.timeTrackingService.clockOut(entry._id, { clockOutMethod: 'web' }).subscribe({
      next: () => {
        this.activeEntry.set(null);
        this.currentDuration.set('00:00:00');
        this.toastService.success('Clocked out successfully');
        this.loadEntries();
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to clock out');
        console.error('Error clocking out:', error);
        this.loadingService.hide();
      }
    });
  }

  approveEntry(entryId: string) {
    if (!confirm('Are you sure you want to approve this time entry?')) return;

    this.loadingService.show();
    this.timeTrackingService.approve(entryId).subscribe({
      next: () => {
        this.toastService.success('Time entry approved');
        this.loadEntries();
      },
      error: (error) => {
        this.toastService.error('Failed to approve time entry');
        console.error('Error approving entry:', error);
        this.loadingService.hide();
      }
    });
  }

  adjustEntry(entry: TimeEntry) {
    // For now, just navigate to a detail/edit page
    this.toastService.info('Time adjustment feature coming soon');
  }

  startDurationTimer() {
    this.durationInterval = window.setInterval(() => {
      const entry = this.activeEntry();
      if (entry) {
        const clockInTime = new Date(entry.clockIn).getTime();
        const now = Date.now();
        const duration = now - clockInTime;

        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((duration % (1000 * 60)) / 1000);

        this.currentDuration.set(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);
  }

  updateSearch(value: string) {
    this.searchQuery.set(value);
  }

  updateStatusFilter(value: string) {
    this.selectedStatus.set(value);
  }
}
