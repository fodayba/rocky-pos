export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export interface PurchaseOrderItem {
  _id: string;
  productId: string;
  productName: string;
  productSku?: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
}

export interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  locationId: string;
  status: PurchaseOrderStatus;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms?: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  internalNotes?: string;
  createdBy: string;
  approvedBy?: string;
  approvalDate?: Date;
  receivedBy?: string;
  receivedDate?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  cancellationDate?: Date;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  locationId: string;
  expectedDeliveryDate?: Date;
  items: {
    productId: string;
    quantityOrdered: number;
    unitCost: number;
  }[];
  shippingCost?: number;
  discountAmount?: number;
  paymentTerms?: string;
  notes?: string;
  internalNotes?: string;
}

export interface UpdatePurchaseOrderDto {
  expectedDeliveryDate?: Date;
  items?: {
    productId: string;
    quantityOrdered: number;
    unitCost: number;
  }[];
  shippingCost?: number;
  discountAmount?: number;
  paymentTerms?: string;
  notes?: string;
  internalNotes?: string;
}

export interface ReceivePurchaseOrderDto {
  items: {
    itemId: string;
    quantityReceived: number;
  }[];
  actualDeliveryDate?: Date;
  notes?: string;
}

export interface PurchaseOrderStatistics {
  totalOrders: number;
  totalDraft: number;
  totalPending: number;
  totalApproved: number;
  totalReceived: number;
  totalCancelled: number;
  totalValue: number;
  averageOrderValue: number;
  totalOutstanding: number;
}
