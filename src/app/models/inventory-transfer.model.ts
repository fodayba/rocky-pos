export enum TransferStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial',
}

export interface TransferItem {
  _id: string;
  productId: string;
  productName: string;
  productSku?: string;
  quantityRequested: number;
  quantityShipped: number;
  quantityReceived: number;
  notes?: string;
}

export interface InventoryTransfer {
  _id: string;
  transferNumber: string;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  status: TransferStatus;
  requestDate: Date;
  shippedDate?: Date;
  receivedDate?: Date;
  items: TransferItem[];
  totalItems: number;
  requestedBy: string;
  shippedBy?: string;
  receivedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransferDto {
  fromLocationId: string;
  toLocationId: string;
  items: {
    productId: string;
    quantityRequested: number;
  }[];
  notes?: string;
}

export interface TransferStatistics {
  totalTransfers: number;
  pendingTransfers: number;
  inTransitTransfers: number;
  receivedTransfers: number;
  cancelledTransfers: number;
}
