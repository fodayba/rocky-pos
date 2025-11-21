import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum GiftCardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
}

export class GiftCardTransaction {
  @Prop({ required: true, type: Date })
  timestamp: Date;

  @Prop({ required: true })
  type: string; // 'issue', 'reload', 'purchase', 'refund', 'void'

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: Number })
  balanceAfter: number;

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  locationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Transaction' })
  transactionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  notes: string;
}

@Schema({ timestamps: true })
export class GiftCard extends Document {
  @Prop({ required: true, unique: true })
  cardNumber: string;

  @Prop({ required: true })
  lastFourDigits: string;

  @Prop({ type: String, enum: GiftCardStatus, default: GiftCardStatus.ACTIVE })
  status: GiftCardStatus;

  @Prop({ required: true, type: Number })
  balance: number;

  @Prop({ required: true, type: Number })
  initialValue: number;

  @Prop({ type: Number, default: 0 })
  totalLoaded: number;

  @Prop({ type: Number, default: 0 })
  totalSpent: number;

  // Issuance
  @Prop({ type: Types.ObjectId, ref: 'Location' })
  issuedLocationId: Types.ObjectId;

  @Prop({ type: Date })
  issueDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  issuedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Transaction' })
  purchaseTransactionId: Types.ObjectId; // Transaction where card was purchased

  // Customer information (optional)
  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId: Types.ObjectId;

  @Prop()
  recipientName: string;

  @Prop()
  recipientEmail: string;

  @Prop()
  recipientPhone: string;

  @Prop()
  purchaserName: string; // Person who bought the gift card

  @Prop()
  purchaserEmail: string;

  // PIN for security
  @Prop()
  pin: string; // Encrypted 4-digit PIN

  @Prop({ default: false })
  requiresPin: boolean;

  // Expiration
  @Prop()
  expiryDate: Date;

  @Prop({ default: false })
  neverExpires: boolean;

  // Restrictions
  @Prop({ type: [Types.ObjectId], ref: 'Location', default: [] })
  validLocations: Types.ObjectId[]; // Empty = all locations

  @Prop({ type: [String], default: [] })
  restrictedCategories: string[]; // Product categories not allowed

  // Lost/stolen
  @Prop({ default: false })
  isReplacement: boolean;

  @Prop({ type: Types.ObjectId, ref: 'GiftCard' })
  replacesCardId: Types.ObjectId;

  @Prop({ default: false })
  reportedLost: boolean;

  @Prop()
  lostReportDate: Date;

  // Usage tracking
  @Prop({ type: [GiftCardTransaction], default: [] })
  transactions: GiftCardTransaction[];

  @Prop()
  lastUsedDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  lastUsedLocationId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  usageCount: number;

  // Design/type
  @Prop({ default: 'standard' })
  cardDesign: string;

  @Prop({ default: false })
  isDigital: boolean; // Physical vs digital card

  // Notes
  @Prop()
  notes: string;

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const GiftCardSchema = SchemaFactory.createForClass(GiftCard);

GiftCardSchema.index({ cardNumber: 1 }, { unique: true });
GiftCardSchema.index({ status: 1 });
GiftCardSchema.index({ customerId: 1 });
GiftCardSchema.index({ balance: 1 });
