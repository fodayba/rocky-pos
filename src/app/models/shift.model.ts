export type ShiftStatus = 'open' | 'closed';

export interface Shift {
  id: string;
  shiftNumber: string;
  cashierId: string;
  cashierName: string;
  startTime: Date;
  endTime?: Date;
  openingBalance: number;
  closingBalance?: number;
  expectedCash?: number;
  actualCash?: number;
  variance?: number;
  status: ShiftStatus;
  transactionIds: string[];
  notes?: string;
}

export interface ShiftSummary {
  shift: Shift;
  totalTransactions: number;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  mobileSales: number;
  fuelSales: number;
  minimartSales: number;
  returns: number;
}
