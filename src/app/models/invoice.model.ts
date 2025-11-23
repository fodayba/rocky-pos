export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial',
}

export interface InvoiceItem {
  _id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount?: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceDto {
  customerId: string;
  issueDate: Date;
  dueDate: Date;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
}

export interface UpdateInvoiceDto {
  customerId?: string;
  issueDate?: Date;
  dueDate?: Date;
  items?: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
}

export interface RecordPaymentDto {
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  referenceNumber?: string;
  notes?: string;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  draftInvoices: number;
  sentInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  totalOutstanding: number;
}
