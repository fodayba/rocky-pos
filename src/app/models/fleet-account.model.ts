export enum FleetAccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum FleetCardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  LOST = 'lost',
  STOLEN = 'stolen',
}

export interface FleetCard {
  _id: string;
  cardNumber: string;
  driverName?: string;
  vehicleNumber?: string;
  vehiclePlate?: string;
  status: FleetCardStatus;
  dailyLimit?: number;
  monthlyLimit?: number;
  productRestrictions?: string[];
  issuedDate: Date;
  expirationDate?: Date;
  lastUsedDate?: Date;
  suspended: boolean;
  suspensionReason?: string;
  notes?: string;
}

export interface FleetAccountTransaction {
  _id: string;
  cardNumber: string;
  driverName?: string;
  vehicleNumber?: string;
  transactionDate: Date;
  productType: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  locationId: string;
  odometerReading?: number;
  receiptNumber?: string;
}

export interface FleetAccount {
  _id: string;
  accountNumber: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  status: FleetAccountStatus;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  paymentTerms: string;
  billingCycle: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  taxExempt: boolean;
  taxExemptNumber?: string;
  cards: FleetCard[];
  totalCards: number;
  activeCards: number;
  monthlySpend: number;
  totalSpend: number;
  lastTransactionDate?: Date;
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  accountManager?: string;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFleetAccountDto {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  creditLimit: number;
  paymentTerms: string;
  billingCycle?: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  taxExempt?: boolean;
  taxExemptNumber?: string;
  accountManager?: string;
  notes?: string;
}

export interface UpdateFleetAccountDto {
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  creditLimit?: number;
  paymentTerms?: string;
  billingCycle?: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  taxExempt?: boolean;
  taxExemptNumber?: string;
  accountManager?: string;
  notes?: string;
}

export interface IssueFleetCardDto {
  driverName?: string;
  vehicleNumber?: string;
  vehiclePlate?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  productRestrictions?: string[];
  expirationDate?: Date;
  notes?: string;
}

export interface FleetAccountStatistics {
  totalAccounts: number;
  totalActive: number;
  totalInactive: number;
  totalSuspended: number;
  totalCards: number;
  totalActiveCards: number;
  totalCreditLimit: number;
  totalOutstandingBalance: number;
  averageAccountBalance: number;
  totalMonthlySpend: number;
}
