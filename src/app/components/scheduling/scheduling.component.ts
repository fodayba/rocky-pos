import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { SchedulingService } from '../../services/scheduling.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { Shift, ShiftStatus, ScheduleStatistics } from '../../models/schedule.model';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DataTableComponent],
  templateUrl: './scheduling.component.html',
  styleUrl: './scheduling.component.css'
})
export class SchedulingComponent implements OnInit {
  private schedulingService = inject(SchedulingService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  shifts = signal<Shift[]>([]);
  statistics = signal<ScheduleStatistics | null>(null);
  searchQuery = signal('');
  selectedStatus = signal<string>('all');

  filteredShifts = computed(() => {
    let filtered = this.shifts();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(shift =>
        shift.employeeName.toLowerCase().includes(query) ||
        shift.locationName.toLowerCase().includes(query) ||
        shift.position.toLowerCase().includes(query)
      );
    }

    const status = this.selectedStatus();
    if (status !== 'all') {
      filtered = filtered.filter(shift => shift.status === status);
    }

    return filtered;
  });

  columns: TableColumn<Shift>[] = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (row) => {
        const date = new Date(row.date);
        return date.toLocaleDateString();
      }
    },
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true
    },
    {
      key: 'locationName',
      label: 'Location',
      sortable: true
    },
    {
      key: 'position',
      label: 'Position',
      sortable: true
    },
    {
      key: 'startTime',
      label: 'Time',
      sortable: false,
      render: (row) => {
        return `${row.startTime} - ${row.endTime}`;
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const statusColors: Record<string, string> = {
          scheduled: 'bg-blue-100 text-blue-800',
          in_progress: 'bg-green-100 text-green-800',
          completed: 'bg-gray-100 text-gray-800',
          cancelled: 'bg-red-100 text-red-800',
          no_show: 'bg-orange-100 text-orange-800'
        };
        const color = statusColors[row.status] || 'bg-gray-100 text-gray-800';
        return `<span class="badge ${color}">${row.status.replace(/_/g, ' ').toUpperCase()}</span>`;
      }
    }
  ];

  actions: TableAction<Shift>[] = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (shift) => this.editShift(shift._id),
      show: (shift) => shift.status === ShiftStatus.SCHEDULED
    },
    {
      label: 'Cancel',
      icon: 'x',
      onClick: (shift) => this.cancelShift(shift),
      show: (shift) => shift.status === ShiftStatus.SCHEDULED
    },
    {
      label: 'Mark No Show',
      icon: 'alert',
      onClick: (shift) => this.markNoShow(shift),
      show: (shift) => shift.status === ShiftStatus.IN_PROGRESS || shift.status === ShiftStatus.SCHEDULED
    }
  ];

  ngOnInit() {
    this.loadShifts();
    this.loadStatistics();
  }

  loadShifts() {
    this.loadingService.show();
    this.schedulingService.findAll().subscribe({
      next: (shifts) => {
        this.shifts.set(shifts);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load schedules');
        console.error('Error loading schedules:', error);
        this.loadingService.hide();
      }
    });
  }

  loadStatistics() {
    this.schedulingService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  editShift(id: string) {
    this.router.navigate(['/scheduling/edit', id]);
  }

  cancelShift(shift: Shift) {
    const reason = prompt(`Enter reason for cancelling ${shift.employeeName}'s shift:`);
    if (!reason) return;

    this.loadingService.show();
    this.schedulingService.cancel(shift._id, reason).subscribe({
      next: () => {
        this.toastService.success('Shift cancelled');
        this.loadShifts();
      },
      error: (error) => {
        this.toastService.error('Failed to cancel shift');
        console.error('Error cancelling shift:', error);
        this.loadingService.hide();
      }
    });
  }

  markNoShow(shift: Shift) {
    if (!confirm(`Mark ${shift.employeeName} as no-show for this shift?`)) return;

    this.loadingService.show();
    this.schedulingService.markNoShow(shift._id).subscribe({
      next: () => {
        this.toastService.success('Shift marked as no-show');
        this.loadShifts();
      },
      error: (error) => {
        this.toastService.error('Failed to mark no-show');
        console.error('Error marking no-show:', error);
        this.loadingService.hide();
      }
    });
  }

  createShift() {
    this.router.navigate(['/scheduling/create']);
  }

  updateSearch(value: string) {
    this.searchQuery.set(value);
  }

  updateStatusFilter(value: string) {
    this.selectedStatus.set(value);
  }
}
