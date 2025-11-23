import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { IconComponent } from '../shared/icon/icon.component';
import { InventoryTransferService } from '../../services/inventory-transfer.service';
import { InventoryTransfer, TransferStatus, TransferStatistics } from '../../models/inventory-transfer.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-inventory-transfers',
  standalone: true,
  imports: [CommonModule, DataTableComponent, IconComponent],
  templateUrl: './inventory-transfers.component.html',
  styleUrls: ['./inventory-transfers.component.css'],
})
export class InventoryTransfersComponent implements OnInit {
  private transferService = inject(InventoryTransferService);
  private toastService = inject(ToastService);

  transfers = this.transferService.transfers;
  statistics = signal<TransferStatistics | null>(null);
  searchQuery = signal('');
  selectedStatus = signal<string>('all');

  filteredTransfers = computed(() => {
    let transfers = this.transfers();
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();

    if (query) {
      transfers = transfers.filter(
        (transfer) =>
          transfer.transferNumber.toLowerCase().includes(query) ||
          transfer.fromLocationName.toLowerCase().includes(query) ||
          transfer.toLocationName.toLowerCase().includes(query) ||
          transfer.requestedBy.toLowerCase().includes(query)
      );
    }

    if (status !== 'all') {
      transfers = transfers.filter((transfer) => transfer.status === status);
    }

    return transfers;
  });

  columns: TableColumn[] = [
    { key: 'transferNumber', label: 'Transfer #', sortable: true },
    {
      key: 'fromLocationName',
      label: 'From',
      sortable: true,
    },
    {
      key: 'toLocationName',
      label: 'To',
      sortable: true,
    },
    {
      key: 'totalItems',
      label: 'Items',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: InventoryTransfer) => this.renderStatus(row.status),
    },
    {
      key: 'requestDate',
      label: 'Request Date',
      sortable: true,
      render: (row: InventoryTransfer) =>
        new Date(row.requestDate).toLocaleDateString(),
    },
    {
      key: 'requestedBy',
      label: 'Requested By',
      sortable: true,
    },
  ];

  actions: TableAction[] = [
    {
      label: 'View',
      icon: 'info',
      onClick: (row: InventoryTransfer) => this.viewTransfer(row),
    },
    {
      label: 'Ship',
      icon: 'package',
      onClick: (row: InventoryTransfer) => this.shipTransfer(row._id),
      show: (row: InventoryTransfer) => row.status === TransferStatus.PENDING,
    },
    {
      label: 'Receive',
      icon: 'check',
      onClick: (row: InventoryTransfer) => this.receiveTransfer(row),
      show: (row: InventoryTransfer) => row.status === TransferStatus.IN_TRANSIT,
    },
    {
      label: 'Cancel',
      icon: 'x',
      onClick: (row: InventoryTransfer) => this.cancelTransfer(row._id),
      class: 'btn-danger',
      show: (row: InventoryTransfer) =>
        row.status === TransferStatus.PENDING || row.status === TransferStatus.IN_TRANSIT,
    },
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.transferService.findAll().subscribe({
      next: () => {},
      error: (error) => {
        console.error('Failed to load transfers:', error);
        this.toastService.error('Failed to load transfers');
      },
    });

    this.transferService.getStatistics().subscribe({
      next: (stats) => this.statistics.set(stats),
      error: (error) => {
        console.error('Failed to load statistics:', error);
      },
    });
  }

  createTransfer() {
    this.toastService.info('Create transfer dialog would open here');
  }

  viewTransfer(transfer: InventoryTransfer) {
    this.toastService.info(`View transfer: ${transfer.transferNumber}`);
  }

  shipTransfer(id: string) {
    this.transferService.ship(id).subscribe({
      next: () => {
        this.toastService.success('Transfer marked as shipped');
      },
      error: (error) => {
        console.error('Failed to ship transfer:', error);
        this.toastService.error('Failed to ship transfer');
      },
    });
  }

  receiveTransfer(transfer: InventoryTransfer) {
    // In a real app, this would open a dialog to confirm received quantities
    const items = transfer.items.map((item) => ({
      productId: item.productId,
      quantityReceived: item.quantityShipped,
    }));

    this.transferService.receive(transfer._id, items).subscribe({
      next: () => {
        this.toastService.success('Transfer received successfully');
      },
      error: (error) => {
        console.error('Failed to receive transfer:', error);
        this.toastService.error('Failed to receive transfer');
      },
    });
  }

  cancelTransfer(id: string) {
    if (confirm('Are you sure you want to cancel this transfer?')) {
      this.transferService.cancel(id).subscribe({
        next: () => {
          this.toastService.success('Transfer cancelled successfully');
        },
        error: (error) => {
          console.error('Failed to cancel transfer:', error);
          this.toastService.error('Failed to cancel transfer');
        },
      });
    }
  }

  updateSearch(value: string) {
    this.searchQuery.set(value);
  }

  updateStatusFilter(value: string) {
    this.selectedStatus.set(value);
  }

  private renderStatus(status: TransferStatus): string {
    const statusConfig: Record<
      TransferStatus,
      { label: string; bgColor: string; textColor: string }
    > = {
      [TransferStatus.PENDING]: {
        label: 'Pending',
        bgColor: 'var(--color-yellow-100)',
        textColor: 'var(--color-yellow-700)',
      },
      [TransferStatus.IN_TRANSIT]: {
        label: 'In Transit',
        bgColor: 'var(--color-blue-100)',
        textColor: 'var(--color-blue-700)',
      },
      [TransferStatus.RECEIVED]: {
        label: 'Received',
        bgColor: 'var(--color-green-100)',
        textColor: 'var(--color-green-700)',
      },
      [TransferStatus.CANCELLED]: {
        label: 'Cancelled',
        bgColor: 'var(--color-red-100)',
        textColor: 'var(--color-red-700)',
      },
      [TransferStatus.PARTIAL]: {
        label: 'Partial',
        bgColor: 'var(--color-orange-100)',
        textColor: 'var(--color-orange-700)',
      },
    };

    const config = statusConfig[status];
    return `<span class="badge" style="background-color: ${config.bgColor}; color: ${config.textColor};">${config.label}</span>`;
  }
}
