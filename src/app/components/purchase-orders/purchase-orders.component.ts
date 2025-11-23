import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderStatistics } from '../../models/purchase-order.model';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DataTableComponent],
  templateUrl: './purchase-orders.component.html',
  styleUrl: './purchase-orders.component.css'
})
export class PurchaseOrdersComponent implements OnInit {
  private purchaseOrderService = inject(PurchaseOrderService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  purchaseOrders = signal<PurchaseOrder[]>([]);
  statistics = signal<PurchaseOrderStatistics | null>(null);
  searchQuery = signal('');
  selectedStatus = signal<string>('all');

  filteredPurchaseOrders = computed(() => {
    let filtered = this.purchaseOrders();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(po =>
        po.orderNumber.toLowerCase().includes(query) ||
        po.supplierName.toLowerCase().includes(query) ||
        po.status.toLowerCase().includes(query)
      );
    }

    const status = this.selectedStatus();
    if (status !== 'all') {
      filtered = filtered.filter(po => po.status === status);
    }

    return filtered;
  });

  columns: TableColumn<PurchaseOrder>[] = [
    {
      key: 'orderNumber',
      label: 'PO Number',
      sortable: true,
      render: (row) => {
        return `<span class="font-semibold">${row.orderNumber}</span>`;
      }
    },
    {
      key: 'supplierName',
      label: 'Supplier',
      sortable: true
    },
    {
      key: 'orderDate',
      label: 'Order Date',
      sortable: true,
      render: (row) => {
        const date = new Date(row.orderDate);
        return date.toLocaleDateString();
      }
    },
    {
      key: 'expectedDeliveryDate',
      label: 'Expected Delivery',
      sortable: true,
      render: (row) => {
        if (!row.expectedDeliveryDate) return '<span class="text-stone-400">Not set</span>';
        const date = new Date(row.expectedDeliveryDate);
        return date.toLocaleDateString();
      }
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      sortable: true,
      render: (row) => {
        return `<span class="font-semibold text-stone-900">$${row.totalAmount.toFixed(2)}</span>`;
      }
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      render: (row) => {
        const statusColors: Record<string, string> = {
          unpaid: 'bg-red-100 text-red-800',
          partial: 'bg-yellow-100 text-yellow-800',
          paid: 'bg-green-100 text-green-800'
        };
        const color = statusColors[row.paymentStatus] || 'bg-gray-100 text-gray-800';
        return `<span class="badge ${color}">${row.paymentStatus.toUpperCase()}</span>`;
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const statusColors: Record<string, string> = {
          draft: 'bg-gray-100 text-gray-800',
          pending_approval: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-blue-100 text-blue-800',
          sent: 'bg-purple-100 text-purple-800',
          partially_received: 'bg-orange-100 text-orange-800',
          received: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
          disputed: 'bg-red-100 text-red-800'
        };
        const color = statusColors[row.status] || 'bg-gray-100 text-gray-800';
        const label = row.status.replace(/_/g, ' ').toUpperCase();
        return `<span class="badge ${color}">${label}</span>`;
      }
    }
  ];

  actions: TableAction<PurchaseOrder>[] = [
    {
      label: 'View Details',
      icon: 'search',
      onClick: (po) => this.viewDetails(po._id)
    },
    {
      label: 'Approve',
      icon: 'check',
      onClick: (po) => this.approvePurchaseOrder(po),
      show: (po) => po.status === PurchaseOrderStatus.PENDING_APPROVAL
    },
    {
      label: 'Send to Supplier',
      icon: 'inbox',
      onClick: (po) => this.sendPurchaseOrder(po),
      show: (po) => po.status === PurchaseOrderStatus.APPROVED
    },
    {
      label: 'Receive',
      icon: 'package',
      onClick: (po) => this.receivePurchaseOrder(po),
      show: (po) => po.status === PurchaseOrderStatus.SENT || po.status === PurchaseOrderStatus.PARTIALLY_RECEIVED
    },
    {
      label: 'Cancel',
      icon: 'x',
      onClick: (po) => this.cancelPurchaseOrder(po),
      show: (po) => po.status !== PurchaseOrderStatus.RECEIVED && po.status !== PurchaseOrderStatus.CANCELLED
    }
  ];

  ngOnInit() {
    this.loadPurchaseOrders();
    this.loadStatistics();
  }

  loadPurchaseOrders() {
    this.loadingService.show();
    this.purchaseOrderService.findAll().subscribe({
      next: (orders) => {
        this.purchaseOrders.set(orders);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.error('Failed to load purchase orders');
        console.error('Error loading purchase orders:', error);
        this.loadingService.hide();
      }
    });
  }

  loadStatistics() {
    this.purchaseOrderService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  viewDetails(id: string) {
    this.router.navigate(['/purchase-orders', id]);
  }

  approvePurchaseOrder(po: PurchaseOrder) {
    if (!confirm(`Approve purchase order ${po.orderNumber}?`)) return;

    this.loadingService.show();
    this.purchaseOrderService.approve(po._id).subscribe({
      next: () => {
        this.toastService.success('Purchase order approved');
        this.loadPurchaseOrders();
      },
      error: (error) => {
        this.toastService.error('Failed to approve purchase order');
        console.error('Error approving purchase order:', error);
        this.loadingService.hide();
      }
    });
  }

  sendPurchaseOrder(po: PurchaseOrder) {
    if (!confirm(`Send purchase order ${po.orderNumber} to supplier?`)) return;

    this.loadingService.show();
    this.purchaseOrderService.send(po._id).subscribe({
      next: () => {
        this.toastService.success('Purchase order sent to supplier');
        this.loadPurchaseOrders();
      },
      error: (error) => {
        this.toastService.error('Failed to send purchase order');
        console.error('Error sending purchase order:', error);
        this.loadingService.hide();
      }
    });
  }

  receivePurchaseOrder(po: PurchaseOrder) {
    // In a real app, this would open a modal to enter received quantities
    this.toastService.info('Receiving functionality - open detail page to receive items');
    this.viewDetails(po._id);
  }

  cancelPurchaseOrder(po: PurchaseOrder) {
    const reason = prompt(`Enter reason for cancelling purchase order ${po.orderNumber}:`);
    if (!reason) return;

    this.loadingService.show();
    this.purchaseOrderService.cancel(po._id, reason).subscribe({
      next: () => {
        this.toastService.success('Purchase order cancelled');
        this.loadPurchaseOrders();
      },
      error: (error) => {
        this.toastService.error('Failed to cancel purchase order');
        console.error('Error cancelling purchase order:', error);
        this.loadingService.hide();
      }
    });
  }

  createPurchaseOrder() {
    this.router.navigate(['/purchase-orders/create']);
  }

  updateSearch(value: string) {
    this.searchQuery.set(value);
  }

  updateStatusFilter(value: string) {
    this.selectedStatus.set(value);
  }
}
