export enum PromotionType {
  PERCENTAGE_DISCOUNT = 'percentage_discount',
  FIXED_AMOUNT_DISCOUNT = 'fixed_amount_discount',
  BUY_X_GET_Y = 'buy_x_get_y',
  BUNDLE = 'bundle',
  LOYALTY_POINTS_MULTIPLIER = 'loyalty_points_multiplier',
  FREE_ITEM = 'free_item',
}

export enum PromotionStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PAUSED = 'paused',
}

export interface Promotion {
  _id: string;
  name: string;
  description?: string;
  type: PromotionType;
  status: PromotionStatus;

  // Applicability
  applicableLocations: string[];
  applicableProducts: string[];
  applicableCategories: string[];

  // Timing
  startDate: Date;
  endDate: Date;
  daysOfWeek: number[];
  startTime?: string;
  endTime?: string;

  // Discount details
  discountPercent?: number;
  discountAmount?: number;
  pointsMultiplier?: number;

  // Buy X Get Y details
  buyQuantity?: number;
  getQuantity?: number;
  getProductId?: string;

  // Conditions
  minimumPurchaseAmount?: number;
  minimumQuantity?: number;
  requiredCustomerTiers: string[];
  newCustomersOnly: boolean;

  // Limits
  usageLimitPerCustomer?: number;
  totalUsageLimit?: number;
  currentUsageCount: number;

  // Stacking rules
  stackable: boolean;
  priority?: number;

  // Coupon code
  couponCode?: string;
  requiresCouponCode: boolean;

  // Performance tracking
  totalRevenue: number;
  totalDiscount: number;
  totalTransactions: number;

  // Notes
  notes?: string;
  terms?: string;

  // Audit
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromotionDto {
  name: string;
  description?: string;
  type: PromotionType;
  applicableLocations?: string[];
  applicableProducts?: string[];
  applicableCategories?: string[];
  startDate: Date | string;
  endDate: Date | string;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  discountPercent?: number;
  discountAmount?: number;
  pointsMultiplier?: number;
  buyQuantity?: number;
  getQuantity?: number;
  getProductId?: string;
  minimumPurchaseAmount?: number;
  minimumQuantity?: number;
  requiredCustomerTiers?: string[];
  newCustomersOnly?: boolean;
  usageLimitPerCustomer?: number;
  totalUsageLimit?: number;
  stackable?: boolean;
  priority?: number;
  couponCode?: string;
  requiresCouponCode?: boolean;
  notes?: string;
  terms?: string;
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {}
