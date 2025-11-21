export interface Customer {
  _id: string;
  id?: string; // Keep for backwards compatibility
  primaryLocation?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: Date;
  customerType?: 'regular' | 'fleet' | 'commercial' | 'vip';
  loyaltyCardNumber?: string;
  loyaltyPoints: number;
  lifetimePoints?: number;
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  loyaltyEnrollmentDate?: Date;
  loyaltyActive?: boolean;
  totalSpent: number;
  thisMonthSpent?: number;
  thisYearSpent?: number;
  visitCount: number;
  lastVisit?: Date;
  lastVisitLocation?: string;
  averageTransactionValue?: number;
  preferredReceiptMethod?: 'print' | 'email' | 'sms' | 'none';
  marketingOptIn?: boolean;
  smsOptIn?: boolean;
  emailOptIn?: boolean;
  favoriteProducts?: string[];
  tags?: string[];
  active?: boolean;
  inactiveReason?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  transactionId: string;
  pointsEarned: number;
  pointsRedeemed: number;
  date: Date;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  discountAmount?: number;
  discountPercentage?: number;
  active: boolean;
}
