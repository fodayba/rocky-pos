import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransactionType {
  SALE = 'sale',
  RETURN = 'return',
  VOID = 'void',
  REFUND = 'refund',
}

export enum PaymentMethod {
  CASH = 'cash',
  DEBIT_CARD = 'debit_card',
  CREDIT_CARD = 'credit_card',
  MOBILE = 'mobile',
  FLEET_CARD = 'fleet_card',
  GIFT_CARD = 'gift_card',
  EBT = 'ebt',
  CHECK = 'check',
  ACCOUNT_CHARGE = 'account_charge', // For fleet/commercial accounts
}

export class TransactionItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop()
  productCategory: string;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Number })
  unitPrice: number;

  @Prop({ type: Number, default: 0 })
  discount: number; // Discount amount per item

  @Prop({ type: Number, default: 0 })
  discountPercent: number; // Discount percentage

  @Prop({ required: true, type: Number })
  subtotal: number;

  @Prop({ type: Number, default: 0 })
  taxAmount: number;

  @Prop({ default: false })
  isFuel: boolean;

  @Prop({ type: Number })
  fuelGallons: number;

  @Prop()
  pumpNumber: string;

  // For age-restricted items
  @Prop({ default: false })
  ageVerified: boolean;

  @Prop()
  ageVerificationMethod: string; // 'id_scan', 'manual', 'manager_override'
}

export class PaymentDetail {
  @Prop({ required: true, enum: PaymentMethod })
  method: PaymentMethod;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop()
  cardLast4: string; // Last 4 digits of card

  @Prop()
  cardType: string; // Visa, Mastercard, etc.

  @Prop()
  authorizationCode: string;

  @Prop()
  fleetCardNumber: string;

  @Prop()
  giftCardNumber: string;

  @Prop()
  checkNumber: string;

  @Prop({ type: Number })
  cashReceived: number;

  @Prop({ type: Number })
  changeGiven: number;
}

@Schema({ timestamps: true })
export class Transaction extends Document {
  // Location reference
  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;

  @Prop({ required: true })
  transactionNumber: string; // Unique per location

  @Prop({ required: true, enum: TransactionType, default: TransactionType.SALE })
  type: TransactionType;

  @Prop({ type: [TransactionItem], default: [] })
  items: TransactionItem[];

  @Prop({ required: true, type: Number })
  subtotal: number;

  @Prop({ type: Number, default: 0 })
  discountTotal: number; // Total discounts applied

  @Prop()
  discountReason: string; // Employee discount, promotion, etc.

  @Prop({ required: true, type: Number })
  tax: number;

  @Prop({ required: true, type: Number })
  total: number;

  // Support for split tender (multiple payment methods)
  @Prop({ type: [PaymentDetail], default: [] })
  payments: PaymentDetail[];

  // Legacy single payment method (kept for backward compatibility)
  @Prop({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Prop({ type: Number })
  cashReceived: number;

  @Prop({ type: Number })
  changeGiven: number;

  // Customer & Fleet Account
  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'FleetAccount' })
  fleetAccountId: Types.ObjectId;

  @Prop()
  driverName: string; // For fleet transactions

  @Prop()
  vehicleNumber: string; // For fleet transactions

  @Prop()
  odometerReading: number; // For fleet transactions

  // Loyalty & Promotions
  @Prop({ type: Number, default: 0 })
  loyaltyPointsEarned: number;

  @Prop({ type: Number, default: 0 })
  loyaltyPointsRedeemed: number;

  @Prop({ type: [String], default: [] })
  promotionsApplied: string[]; // IDs of promotions applied

  @Prop({ type: [String], default: [] })
  couponsUsed: string[]; // Coupon codes used

  // Staff
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  cashierId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  managerOverrideId: Types.ObjectId; // If manager authorization was needed

  @Prop({ required: true, type: Types.ObjectId, ref: 'Shift' })
  shiftId: Types.ObjectId;

  // Return/Void Information
  @Prop({ type: Types.ObjectId, ref: 'Transaction' })
  originalTransactionId: Types.ObjectId; // For returns/voids

  @Prop()
  voidReason: string;

  @Prop()
  returnReason: string;

  // Receipt
  @Prop({ default: false })
  receiptPrinted: boolean;

  @Prop({ default: false })
  receiptEmailed: boolean;

  @Prop({ default: false })
  receiptSMS: boolean;

  @Prop()
  receiptEmail: string;

  @Prop()
  receiptPhone: string;

  // Status
  @Prop({ default: 'completed' })
  status: string; // completed, pending, voided, returned

  @Prop()
  notes: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes for better query performance
TransactionSchema.index({ locationId: 1, transactionNumber: 1 }, { unique: true });
TransactionSchema.index({ locationId: 1, createdAt: -1 });
TransactionSchema.index({ shiftId: 1 });
TransactionSchema.index({ cashierId: 1 });
TransactionSchema.index({ customerId: 1 });
TransactionSchema.index({ fleetAccountId: 1 });
TransactionSchema.index({ status: 1 });
