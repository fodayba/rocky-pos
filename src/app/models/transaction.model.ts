export type TransactionType = 'sale' | 'return' | 'void';
export type PaymentMethod = 'cash' | 'card' | 'mobile';

export interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isFuel: boolean;
  fuelGallons?: number;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  type: TransactionType;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
  customerId?: string;
  cashierId: string;
  shiftId: string;
  createdAt: Date;
}

export interface Receipt {
  transaction: Transaction;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  cashierName: string;
}
