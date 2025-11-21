export enum GiftCardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REDEEMED = 'redeemed',
  SUSPENDED = 'suspended',
}

export interface GiftCardTransaction {
  _id: string;
  type: 'purchase' | 'reload' | 'redemption' | 'refund' | 'adjustment' | 'expiration';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  locationId?: string;
  transactionId?: string;
  employeeId?: string;
  notes?: string;
  createdAt: Date;
}

export interface GiftCard {
  _id: string;
  cardNumber: string;
  pin?: string;
  customerId?: string;
  customerName?: string;
  initialBalance: number;
  currentBalance: number;
  status: GiftCardStatus;
  expirationDate?: Date;
  purchaseDate: Date;
  lastUsedDate?: Date;
  purchasedBy?: string;
  purchaseLocationId?: string;
  isPhysical: boolean;
  activationDate?: Date;
  activatedBy?: string;
  suspended: boolean;
  suspensionReason?: string;
  suspendedBy?: string;
  suspensionDate?: Date;
  reloadable: boolean;
  transferable: boolean;
  notes?: string;
  transactions: GiftCardTransaction[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueGiftCardDto {
  initialBalance: number;
  customerId?: string;
  expirationDate?: Date;
  isPhysical: boolean;
  pin?: string;
  reloadable?: boolean;
  transferable?: boolean;
  notes?: string;
}

export interface RedeemGiftCardDto {
  amount: number;
  pin: string;
  locationId: string;
  transactionId?: string;
}

export interface ReloadGiftCardDto {
  amount: number;
  locationId: string;
  transactionId?: string;
  notes?: string;
}

export interface GiftCardStatistics {
  totalActive: number;
  totalInactive: number;
  totalExpired: number;
  totalRedeemed: number;
  totalSuspended: number;
  totalValue: number;
  totalRedeemed_amount: number;
  totalOutstandingBalance: number;
  averageCardValue: number;
  totalIssued: number;
  totalTransactions: number;
}
