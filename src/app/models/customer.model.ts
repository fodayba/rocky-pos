export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  createdAt: Date;
  lastVisit?: Date;
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
