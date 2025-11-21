import { Injectable, signal, computed } from '@angular/core';
import { Shift, ShiftSummary } from '../models';
import { StorageService } from './storage.service';
import { TransactionService } from './transaction.service';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private readonly SHIFTS_KEY = 'shifts';
  private readonly CURRENT_SHIFT_KEY = 'current_shift';

  private shiftsSignal = signal<Shift[]>([]);
  private currentShiftSignal = signal<Shift | null>(null);

  public readonly shifts = this.shiftsSignal.asReadonly();
  public readonly currentShift = this.currentShiftSignal.asReadonly();
  public readonly hasActiveShift = computed(() => this.currentShift() !== null);

  constructor(
    private storage: StorageService,
    private transactionService: TransactionService
  ) {
    this.loadShifts();
    this.loadCurrentShift();
  }

  private loadShifts(): void {
    const stored = this.storage.getItem<Shift[]>(this.SHIFTS_KEY);
    if (stored) {
      this.shiftsSignal.set(stored);
    } else {
      this.shiftsSignal.set([]);
    }
  }

  private loadCurrentShift(): void {
    const stored = this.storage.getItem<Shift>(this.CURRENT_SHIFT_KEY);
    if (stored && stored.status === 'open') {
      this.currentShiftSignal.set(stored);
    } else {
      this.storage.removeItem(this.CURRENT_SHIFT_KEY);
    }
  }

  openShift(cashierId: string, cashierName: string, openingBalance: number): Shift {
    if (this.currentShift()) {
      throw new Error('A shift is already open. Please close the current shift first.');
    }

    const shift: Shift = {
      id: this.generateId(),
      shiftNumber: this.generateShiftNumber(),
      cashierId,
      cashierName,
      startTime: new Date(),
      openingBalance,
      status: 'open',
      transactionIds: []
    };

    this.currentShiftSignal.set(shift);
    this.storage.setItem(this.CURRENT_SHIFT_KEY, shift);

    return shift;
  }

  closeShift(actualCash: number, notes?: string): Shift | null {
    const shift = this.currentShift();
    if (!shift) {
      throw new Error('No active shift to close');
    }

    const transactions = this.transactionService.getTransactionsByShift(shift.id);
    const paymentTotals = this.transactionService.getTotalSalesByPaymentMethod(transactions);

    const expectedCash = shift.openingBalance + (paymentTotals.cash || 0);
    const variance = actualCash - expectedCash;

    const closedShift: Shift = {
      ...shift,
      endTime: new Date(),
      closingBalance: actualCash,
      expectedCash,
      actualCash,
      variance,
      status: 'closed',
      transactionIds: transactions.map(t => t.id),
      notes
    };

    const shifts = [...this.shiftsSignal(), closedShift];
    this.shiftsSignal.set(shifts);
    this.storage.setItem(this.SHIFTS_KEY, shifts);

    this.currentShiftSignal.set(null);
    this.storage.removeItem(this.CURRENT_SHIFT_KEY);

    return closedShift;
  }

  getShiftSummary(shiftId: string): ShiftSummary | null {
    const shift = this.shiftsSignal().find(s => s.id === shiftId) || this.currentShift();
    if (!shift || shift.id !== shiftId) return null;

    const transactions = this.transactionService.getTransactionsByShift(shiftId);
    const paymentTotals = this.transactionService.getTotalSalesByPaymentMethod(transactions);

    const fuelSales = transactions.reduce((sum, t) => {
      return sum + t.items
        .filter(item => item.isFuel)
        .reduce((itemSum, item) => itemSum + item.subtotal, 0);
    }, 0);

    const minimartSales = transactions.reduce((sum, t) => {
      return sum + t.items
        .filter(item => !item.isFuel)
        .reduce((itemSum, item) => itemSum + item.subtotal, 0);
    }, 0);

    const returns = transactions
      .filter(t => t.type === 'return')
      .reduce((sum, t) => sum + t.total, 0);

    const totalSales = transactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.total, 0);

    return {
      shift,
      totalTransactions: transactions.length,
      totalSales,
      cashSales: paymentTotals.cash || 0,
      cardSales: paymentTotals.card || 0,
      mobileSales: paymentTotals.mobile || 0,
      fuelSales,
      minimartSales,
      returns
    };
  }

  getCurrentShiftSummary(): ShiftSummary | null {
    const shift = this.currentShift();
    return shift ? this.getShiftSummary(shift.id) : null;
  }

  private generateId(): string {
    return 'shift_' + Date.now() + '_' + Math.random().toString(36).substring(2);
  }

  private generateShiftNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = this.shiftsSignal().filter(s =>
      s.startTime.toString().startsWith(date.toISOString().slice(0, 10))
    ).length + 1;
    return `S${dateStr}-${count.toString().padStart(3, '0')}`;
  }
}
