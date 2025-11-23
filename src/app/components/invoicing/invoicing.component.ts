import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { IconComponent } from '../shared/icon/icon.component';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice, InvoiceStatus, InvoiceStatistics } from '../../models/invoice.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-invoicing',
  standalone: true,
  imports: [CommonModule, DataTableComponent, IconComponent],
  templateUrl: './invoicing.component.html',
  styleUrls: ['./invoicing.component.css'],
})
export class InvoicingComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private toastService = inject(ToastService);

  invoices = this.invoiceService.invoices;
  statistics = signal<InvoiceStatistics | null>(null);
  searchQuery = signal('');
  selectedStatus = signal<string>('all');

  filteredInvoices = computed(() => {
    let invoices = this.invoices();
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();

    if (query) {
      invoices = invoices.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(query) ||
          invoice.customerName.toLowerCase().includes(query)
      );
    }

    if (status !== 'all') {
      invoices = invoices.filter((invoice) => invoice.status === status);
    }

    return invoices;
  });

  columns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      sortable: true,
      render: (row: Invoice) => new Date(row.issueDate).toLocaleDateString(),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (row: Invoice) => new Date(row.dueDate).toLocaleDateString(),
    },
    {
      key: 'totalAmount',
      label: 'Total',
      sortable: true,
      render: (row: Invoice) => `${row.currency} ${row.totalAmount.toFixed(2)}`,
    },
    {
      key: 'amountDue',
      label: 'Amount Due',
      sortable: true,
      render: (row: Invoice) => `${row.currency} ${row.amountDue.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: Invoice) => this.renderStatus(row.status),
    },
  ];

  actions: TableAction[] = [
    {
      label: 'View',
      icon: 'info',
      onClick: (row: Invoice) => this.viewInvoice(row),
    },
    {
      label: 'Send',
      icon: 'inbox',
      onClick: (row: Invoice) => this.sendInvoice(row._id),
      show: (row: Invoice) => row.status === InvoiceStatus.DRAFT,
    },
    {
      label: 'Record Payment',
      icon: 'dollar',
      onClick: (row: Invoice) => this.recordPayment(row),
      show: (row: Invoice) =>
        row.status === InvoiceStatus.SENT ||
        row.status === InvoiceStatus.OVERDUE ||
        row.status === InvoiceStatus.PARTIAL,
    },
    {
      label: 'Cancel',
      icon: 'x',
      onClick: (row: Invoice) => this.cancelInvoice(row._id),
      class: 'btn-danger',
      show: (row: Invoice) => row.status !== InvoiceStatus.PAID && row.status !== InvoiceStatus.CANCELLED,
    },
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.invoiceService.findAll().subscribe({
      next: () => {},
      error: (error) => {
        console.error('Failed to load invoices:', error);
        this.toastService.error('Failed to load invoices');
      },
    });

    this.invoiceService.getStatistics().subscribe({
      next: (stats) => this.statistics.set(stats),
      error: (error) => {
        console.error('Failed to load statistics:', error);
      },
    });
  }

  createInvoice() {
    this.toastService.info('Create invoice dialog would open here');
  }

  viewInvoice(invoice: Invoice) {
    this.toastService.info(`View invoice: ${invoice.invoiceNumber}`);
  }

  sendInvoice(id: string) {
    this.invoiceService.send(id).subscribe({
      next: () => {
        this.toastService.success('Invoice sent successfully');
      },
      error: (error) => {
        console.error('Failed to send invoice:', error);
        this.toastService.error('Failed to send invoice');
      },
    });
  }

  recordPayment(invoice: Invoice) {
    // In a real app, this would open a dialog to enter payment details
    const paymentDto = {
      amount: invoice.amountDue,
      paymentMethod: 'cash',
      paymentDate: new Date(),
      notes: 'Payment recorded',
    };

    this.invoiceService.recordPayment(invoice._id, paymentDto).subscribe({
      next: () => {
        this.toastService.success('Payment recorded successfully');
      },
      error: (error) => {
        console.error('Failed to record payment:', error);
        this.toastService.error('Failed to record payment');
      },
    });
  }

  cancelInvoice(id: string) {
    if (confirm('Are you sure you want to cancel this invoice?')) {
      this.invoiceService.cancel(id).subscribe({
        next: () => {
          this.toastService.success('Invoice cancelled successfully');
        },
        error: (error) => {
          console.error('Failed to cancel invoice:', error);
          this.toastService.error('Failed to cancel invoice');
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

  private renderStatus(status: InvoiceStatus): string {
    const statusConfig: Record<
      InvoiceStatus,
      { label: string; bgColor: string; textColor: string }
    > = {
      [InvoiceStatus.DRAFT]: {
        label: 'Draft',
        bgColor: 'var(--color-stone-200)',
        textColor: 'var(--color-stone-700)',
      },
      [InvoiceStatus.SENT]: {
        label: 'Sent',
        bgColor: 'var(--color-blue-100)',
        textColor: 'var(--color-blue-700)',
      },
      [InvoiceStatus.PAID]: {
        label: 'Paid',
        bgColor: 'var(--color-green-100)',
        textColor: 'var(--color-green-700)',
      },
      [InvoiceStatus.OVERDUE]: {
        label: 'Overdue',
        bgColor: 'var(--color-red-100)',
        textColor: 'var(--color-red-700)',
      },
      [InvoiceStatus.CANCELLED]: {
        label: 'Cancelled',
        bgColor: 'var(--color-stone-200)',
        textColor: 'var(--color-stone-700)',
      },
      [InvoiceStatus.PARTIAL]: {
        label: 'Partial',
        bgColor: 'var(--color-yellow-100)',
        textColor: 'var(--color-yellow-700)',
      },
    };

    const config = statusConfig[status];
    return `<span class="badge" style="background-color: ${config.bgColor}; color: ${config.textColor};">${config.label}</span>`;
  }
}
