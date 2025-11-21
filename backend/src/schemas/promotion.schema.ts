import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

@Schema({ timestamps: true })
export class Promotion extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: PromotionType })
  type: PromotionType;

  @Prop({ type: String, enum: PromotionStatus, default: PromotionStatus.DRAFT })
  status: PromotionStatus;

  // Applicability
  @Prop({ type: [Types.ObjectId], ref: 'Location', default: [] })
  applicableLocations: Types.ObjectId[]; // Empty = all locations

  @Prop({ type: [String], default: [] })
  applicableProducts: string[]; // Product IDs

  @Prop({ type: [String], default: [] })
  applicableCategories: string[]; // Product categories

  // Timing
  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ type: [Number], default: [] })
  daysOfWeek: number[]; // 0=Sun, 1=Mon, etc. Empty = all days

  @Prop()
  startTime: string; // e.g., "08:00"

  @Prop()
  endTime: string; // e.g., "20:00"

  // Discount details
  @Prop({ type: Number })
  discountPercent: number;

  @Prop({ type: Number })
  discountAmount: number;

  @Prop({ type: Number })
  pointsMultiplier: number; // e.g., 2 for "double points"

  // Buy X Get Y details
  @Prop({ type: Number })
  buyQuantity: number;

  @Prop({ type: Number })
  getQuantity: number;

  @Prop()
  getProductId: string;

  // Conditions
  @Prop({ type: Number })
  minimumPurchaseAmount: number;

  @Prop({ type: Number })
  minimumQuantity: number;

  @Prop({ type: [String], default: [] })
  requiredCustomerTiers: string[]; // Loyalty tiers required

  @Prop({ default: false })
  newCustomersOnly: boolean;

  // Limits
  @Prop({ type: Number })
  usageLimitPerCustomer: number;

  @Prop({ type: Number })
  totalUsageLimit: number;

  @Prop({ type: Number, default: 0 })
  currentUsageCount: number;

  // Stacking rules
  @Prop({ default: true })
  stackable: boolean; // Can be combined with other promotions

  @Prop({ type: Number })
  priority: number; // Higher priority applied first

  // Coupon code
  @Prop({ unique: true, sparse: true })
  couponCode: string; // If promotion requires a code

  @Prop({ default: false })
  requiresCouponCode: boolean;

  // Performance tracking
  @Prop({ type: Number, default: 0 })
  totalRevenue: number;

  @Prop({ type: Number, default: 0 })
  totalDiscount: number;

  @Prop({ type: Number, default: 0 })
  totalTransactions: number;

  // Notes
  @Prop()
  notes: string;

  @Prop()
  terms: string; // Terms and conditions

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);

PromotionSchema.index({ status: 1 });
PromotionSchema.index({ startDate: 1, endDate: 1 });
PromotionSchema.index({ couponCode: 1 });
PromotionSchema.index({ applicableLocations: 1 });
