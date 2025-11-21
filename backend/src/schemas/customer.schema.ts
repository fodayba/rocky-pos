import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export enum CustomerType {
  REGULAR = 'regular',
  FLEET = 'fleet',
  COMMERCIAL = 'commercial',
  VIP = 'vip',
}

@Schema({ timestamps: true })
export class Customer extends Document {
  // Primary location - where customer was registered
  @Prop({ type: Types.ObjectId, ref: 'Location' })
  primaryLocation: Types.ObjectId;

  // Basic information
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zipCode: string;

  @Prop()
  dateOfBirth: Date;

  // Customer type
  @Prop({ type: String, enum: CustomerType, default: CustomerType.REGULAR })
  customerType: CustomerType;

  // Loyalty program
  @Prop({ unique: true, sparse: true })
  loyaltyCardNumber: string;

  @Prop({ type: Number, default: 0 })
  loyaltyPoints: number;

  @Prop({ type: Number, default: 0 })
  lifetimePoints: number; // Total points ever earned

  @Prop({ type: String, enum: LoyaltyTier, default: LoyaltyTier.BRONZE })
  loyaltyTier: LoyaltyTier;

  @Prop()
  loyaltyEnrollmentDate: Date;

  @Prop({ default: true })
  loyaltyActive: boolean;

  // Spending & visit tracking
  @Prop({ type: Number, default: 0 })
  totalSpent: number;

  @Prop({ type: Number, default: 0 })
  thisMonthSpent: number;

  @Prop({ type: Number, default: 0 })
  thisYearSpent: number;

  @Prop({ type: Number, default: 0 })
  visitCount: number;

  @Prop({ type: Date })
  lastVisit: Date;

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  lastVisitLocation: Types.ObjectId;

  @Prop()
  averageTransactionValue: number;

  // Preferences
  @Prop({ default: 'print' })
  preferredReceiptMethod: string; // print, email, sms, none

  @Prop({ default: false })
  marketingOptIn: boolean;

  @Prop({ default: false })
  smsOptIn: boolean;

  @Prop({ default: false })
  emailOptIn: boolean;

  @Prop({ type: [String], default: [] })
  favoriteProducts: string[]; // Product IDs

  @Prop({ type: [String], default: [] })
  tags: string[]; // For segmentation: 'frequent_buyer', 'fuel_only', etc.

  // Notes & status
  @Prop()
  notes: string;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  inactiveReason: string;

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Indexes
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ loyaltyCardNumber: 1 });
CustomerSchema.index({ loyaltyTier: 1 });
CustomerSchema.index({ primaryLocation: 1 });
CustomerSchema.index({ totalSpent: -1 });
CustomerSchema.index({ visitCount: -1 });
