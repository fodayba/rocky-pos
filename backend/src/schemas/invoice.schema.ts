import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PAID = 'paid',
  PARTIAL_PAYMENT = 'partial_payment',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export class InvoiceLineItem {
  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Transaction' })
  transactionId: Types.ObjectId;

  @Prop({ required: true })
  transactionNumber: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ type: Number, default: 0 })
  tax: number;

  @Prop({ required: true, type: Number })
  total: number;
}

export class Payment {
  @Prop({ required: true, type: Date })
  paymentDate: Date;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true })
  paymentMethod: string; // check, ach, card, cash

  @Prop()
  referenceNumber: string; // Check number, transaction ID, etc.

  @Prop()
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  recordedBy: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Invoice extends Document {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'FleetAccount', required: true })
  fleetAccountId: Types.ObjectId;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  locationId: Types.ObjectId;

  @Prop({ type: String, enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  // Dates
  @Prop({ required: true, type: Date })
  invoiceDate: Date;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop()
  paidDate: Date;

  // Billing period
  @Prop({ required: true, type: Date })
  periodStartDate: Date;

  @Prop({ required: true, type: Date })
  periodEndDate: Date;

  // Line items
  @Prop({ type: [InvoiceLineItem], default: [] })
  lineItems: InvoiceLineItem[];

  // Amounts
  @Prop({ required: true, type: Number })
  subtotal: number;

  @Prop({ type: Number, default: 0 })
  tax: number;

  @Prop({ required: true, type: Number })
  totalAmount: number;

  @Prop({ type: Number, default: 0 })
  amountPaid: number;

  @Prop({ type: Number, default: 0 })
  balance: number;

  // Payments
  @Prop({ type: [Payment], default: [] })
  payments: Payment[];

  // Late fees
  @Prop({ type: Number, default: 0 })
  lateFee: number;

  @Prop()
  lateFeeAppliedDate: Date;

  // Delivery
  @Prop({ default: false })
  emailSent: boolean;

  @Prop()
  emailSentDate: Date;

  @Prop()
  emailAddress: string;

  @Prop({ default: false })
  viewed: boolean;

  @Prop()
  viewedDate: Date;

  // Notes
  @Prop()
  notes: string;

  @Prop()
  termsAndConditions: string;

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ fleetAccountId: 1, invoiceDate: -1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ accountNumber: 1 });
