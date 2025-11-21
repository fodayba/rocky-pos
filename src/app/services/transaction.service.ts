import { Injectable, signal } from '@angular/core';
import { Transaction, TransactionItem, PaymentMethod, TransactionType } from '../models';
import { StorageService } from './storage.service';
import { ProductService } from './product.service';
import { FuelService } from './fuel.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly TRANSACTIONS_KEY = 'transactions';

  private transactionsSignal = signal<Transaction[]>([]);
  public readonly transactions = this.transactionsSignal.asReadonly();

  constructor(
    private storage: StorageService,
    private productService: ProductService,
    private fuelService: FuelService
  ) {
    this.loadTransactions();
  }

  private loadTransactions(): void {
    const stored = this.storage.getItem<Transaction[]>(this.TRANSACTIONS_KEY);
    if (stored) {
      this.transactionsSignal.set(stored);
    } else {
      this.transactionsSignal.set([]);
    }
  }

  createTransaction(
    items: TransactionItem[],
    paymentMethod: PaymentMethod,
    cashierId: string,
    shiftId: string,
    customerId?: string,
    cashReceived?: number
  ): Transaction | null {
    if (items.length === 0) return null;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = items.reduce((sum, item) => {
      const product = this.productService.getProductById(item.productId);
      if (product?.taxable) {
        return sum + (item.subtotal * (product.taxRate || 0));
      }
      return sum;
    }, 0);
    const total = subtotal + tax;

    // Validate cash payment
    if (paymentMethod === 'cash' && (!cashReceived || cashReceived < total)) {
      return null;
    }

    const changeGiven = paymentMethod === 'cash' && cashReceived
      ? cashReceived - total
      : undefined;

    // Update inventory
    for (const item of items) {
      if (item.isFuel) {
        const success = this.fuelService.recordSale(item.productId, item.fuelGallons || 0);
        if (!success) {
          console.error('Failed to update fuel inventory for:', item.productId);
        }
      } else {
        const success = this.productService.updateStock(item.productId, -item.quantity);
        if (!success) {
          console.error('Failed to update product inventory for:', item.productId);
        }
      }
    }

    const transaction: Transaction = {
      id: this.generateId(),
      transactionNumber: this.generateTransactionNumber(),
      type: 'sale',
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      cashReceived,
      changeGiven,
      customerId,
      cashierId,
      shiftId,
      createdAt: new Date()
    };

    const transactions = [...this.transactionsSignal(), transaction];
    this.transactionsSignal.set(transactions);
    this.storage.setItem(this.TRANSACTIONS_KEY, transactions);

    return transaction;
  }

  getTransactionsByShift(shiftId: string): Transaction[] {
    return this.transactionsSignal().filter(t => t.shiftId === shiftId);
  }

  getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.transactionsSignal().filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.transactionsSignal().find(t => t.id === id);
  }

  getTotalSalesByPaymentMethod(transactions: Transaction[]): Record<PaymentMethod, number> {
    return transactions.reduce((acc, t) => {
      if (t.type === 'sale') {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.total;
      }
      return acc;
    }, {} as Record<PaymentMethod, number>);
  }

  private generateId(): string {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2);
  }

  private generateTransactionNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = this.transactionsSignal().filter(t =>
      t.createdAt.toString().startsWith(date.toISOString().slice(0, 10))
    ).length + 1;
    return `${dateStr}-${count.toString().padStart(4, '0')}`;
  }
}
