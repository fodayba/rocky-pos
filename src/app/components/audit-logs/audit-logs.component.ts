import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';
import { DataTableComponent, TableColumn } from '../shared/data-table/data-table.component';
import { AuditService } from '../../services/audit.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { AuditLog, AuditAction, AuditEntity, AuditLogStatistics } from '../../models/audit-log.model';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DataTableComponent],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css'
})
export class AuditLogsComponent implements OnInit {
  private auditService = inject(AuditService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);

  auditLogs = signal<AuditLog[]>([]);
  statistics = signal<AuditLogStatistics | null>(null);
  searchQuery = signal('');
  selectedEntity = signal<string>('all');
  selectedAction = signal<string>('all');
  selectedSeverity = signal<string>('all');

  filteredAuditLogs = computed(() => {
    let filtered = this.auditLogs();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(query) ||
        log.entity.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.description?.toLowerCase().includes(query)
      );
    }

    const entity = this.selectedEntity();
    if (entity !== 'all') {
      filtered = filtered.filter(log => log.entity === entity);
    }

    const action = this.selectedAction();
    if (action !== 'all') {
      filtered = filtered.filter(log => log.action === action);
    }

    const severity = this.selectedSeverity();
    if (severity !== 'all') {
      filtered = filtered.filter(log => log.severity === severity);
    }

    return filtered;
  });

  columns: TableColumn<AuditLog>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (row) => {
        const date = new Date(row.timestamp);
        return date.toLocaleString();
      }
    },
    {
      key: 'userName',
      label: 'User',
      sortable: true,
      render: (row) => {
        return `<span class="font-semibold">${row.userName}</span>`;
      }
    },
    {
      key: 'entity',
      label: 'Entity',
      sortable: true,
      render: (row) => {
        const label = row.entity.replace(/_/g, ' ').toUpperCase();
        return `<span class="text-stone-700">${label}</span>`;
      }
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (row) => {
        const actionColors: Record<string, string> = {
          create: 'bg-green-100 text-green-800',
          update: 'bg-blue-100 text-blue-800',
          delete: 'bg-red-100 text-red-800',
          login: 'bg-purple-100 text-purple-800',
          logout: 'bg-gray-100 text-gray-800',
          approve: 'bg-green-100 text-green-800',
          reject: 'bg-red-100 text-red-800',
          payment: 'bg-blue-100 text-blue-800',
        };
        const color = actionColors[row.action] || 'bg-gray-100 text-gray-800';
        return `<span class="badge ${color}">${row.action.toUpperCase()}</span>`;
      }
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (row) => {
        return row.description || '<span class="text-stone-400">-</span>';
      }
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (row) => {
        if (!row.severity) return '<span class="text-stone-400">-</span>';
        const severityColors: Record<string, string> = {
          low: 'bg-gray-100 text-gray-800',
          medium: 'bg-yellow-100 text-yellow-800',
          high: 'bg-orange-100 text-orange-800',
          critical: 'bg-red-100 text-red-800'
        };
        const color = severityColors[row.severity] || 'bg-gray-100 text-gray-800';
        return `<span class="badge ${color}">${row.severity.toUpperCase()}</span>`;
      }
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      sortable: false,
      render: (row) => {
        return row.ipAddress || '<span class="text-stone-400">-</span>';
      }
    }
  ];

  ngOnInit() {
    this.loadAuditLogs();
    this.loadStatistics();
  }

  loadAuditLogs() {
    this.loadingService.show();
    this.auditService.findAll().subscribe({
      next: (logs) => {
        this.auditLogs.set(logs);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load audit logs');
        console.error('Error loading audit logs:', error);
        this.loadingService.hide();
      }
    });
  }

  loadStatistics() {
    this.auditService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  exportLogs() {
    this.loadingService.show();
    this.auditService.exportLogs().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastService.success('Audit logs exported successfully');
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to export audit logs');
        console.error('Error exporting logs:', error);
        this.loadingService.hide();
      }
    });
  }

  updateSearch(value: string) {
    this.searchQuery.set(value);
  }

  updateEntityFilter(value: string) {
    this.selectedEntity.set(value);
  }

  updateActionFilter(value: string) {
    this.selectedAction.set(value);
  }

  updateSeverityFilter(value: string) {
    this.selectedSeverity.set(value);
  }
}
