import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ShiftStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export class SafeDrop {
  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: Date })
  timestamp: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy: Types.ObjectId;

  @Prop()
  notes: string;
}

export class CashCount {
  @Prop({ type: Number, default: 0 })
  hundreds: number;

  @Prop({ type: Number, default: 0 })
  fifties: number;

  @Prop({ type: Number, default: 0 })
  twenties: number;

  @Prop({ type: Number, default: 0 })
  tens: number;

  @Prop({ type: Number, default: 0 })
  fives: number;

  @Prop({ type: Number, default: 0 })
  ones: number;

  @Prop({ type: Number, default: 0 })
  quarters: number;

  @Prop({ type: Number, default: 0 })
  dimes: number;

  @Prop({ type: Number, default: 0 })
  nickels: number;

  @Prop({ type: Number, default: 0 })
  pennies: number;

  @Prop({ type: Number, default: 0 })
  total: number;
}

@Schema({ timestamps: true })
export class Shift extends Document {
  // Location reference
  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;

  @Prop({ required: true })
  shiftNumber: string; // Unique per location

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ required: true, type: Date })
  startTime: Date;

  @Prop({ type: Date })
  endTime: Date;

  // Cash Management
  @Prop({ required: true, type: Number })
  openingCash: number;

  @Prop({ type: Object })
  openingCashBreakdown: CashCount;

  @Prop({ type: Number })
  closingCash: number;

  @Prop({ type: Object })
  closingCashBreakdown: CashCount;

  @Prop({ type: Number })
  expectedCash: number;

  @Prop({ type: Number })
  cashVariance: number;

  // Safe drops during shift
  @Prop({ type: [SafeDrop], default: [] })
  safeDrops: SafeDrop[];

  @Prop({ type: Number, default: 0 })
  totalSafeDrops: number;

  // Register info
  @Prop({ required: true })
  registerNumber: string;

  // Sales summary
  @Prop({ type: Number, default: 0 })
  totalSales: number;

  @Prop({ type: Number, default: 0 })
  totalTransactions: number;

  @Prop({ type: Number, default: 0 })
  cashSales: number;

  @Prop({ type: Number, default: 0 })
  cardSales: number;

  @Prop({ type: Number, default: 0 })
  otherPayments: number;

  @Prop({ type: Number, default: 0 })
  fuelSales: number;

  @Prop({ type: Number, default: 0 })
  miniMartSales: number;

  @Prop({ type: Number, default: 0 })
  totalReturns: number;

  @Prop({ type: Number, default: 0 })
  totalVoids: number;

  // Status
  @Prop({ required: true, enum: ShiftStatus, default: ShiftStatus.OPEN })
  status: ShiftStatus;

  @Prop()
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  closedBy: Types.ObjectId; // Manager who approved closing
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);

// Indexes
ShiftSchema.index({ locationId: 1, shiftNumber: 1 }, { unique: true });
ShiftSchema.index({ locationId: 1, status: 1 });
ShiftSchema.index({ user: 1, startTime: -1 });
