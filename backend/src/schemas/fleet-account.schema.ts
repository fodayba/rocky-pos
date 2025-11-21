import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
  PENDING_APPROVAL = 'pending_approval',
}

export enum PaymentTerms {
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  PREPAID = 'prepaid',
}

export class FleetVehicle {
  @Prop({ required: true })
  vehicleNumber: string;

  @Prop()
  make: string;

  @Prop()
  model: string;

  @Prop()
  year: number;

  @Prop()
  vin: string;

  @Prop()
  licensePlate: string;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  notes: string;
}

export class FleetDriver {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  driverNumber: string;

  @Prop()
  licenseNumber: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Number })
  pinNumber: number; // 4-digit PIN for pump authorization

  @Prop()
  notes: string;
}

export class FleetCard {
  @Prop({ required: true, unique: true })
  cardNumber: string;

  @Prop({ required: true })
  lastFourDigits: string;

  @Prop()
  assignedTo: string; // Vehicle number or driver number

  @Prop({ type: Date, required: true })
  issueDate: Date;

  @Prop()
  expiryDate: Date;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Number })
  dailyLimit: number;

  @Prop({ type: Number })
  transactionLimit: number;

  @Prop()
  notes: string;
}

@Schema({ timestamps: true })
export class FleetAccount extends Document {
  @Prop({ required: true, unique: true })
  accountNumber: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ type: String, enum: AccountStatus, default: AccountStatus.PENDING_APPROVAL })
  status: AccountStatus;

  // Contact information
  @Prop({ required: true })
  contactName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  billingAddress: string;

  @Prop()
  billingCity: string;

  @Prop()
  billingState: string;

  @Prop()
  billingZipCode: string;

  // Business information
  @Prop()
  taxId: string;

  @Prop()
  businessLicenseNumber: string;

  // Credit terms
  @Prop({ type: String, enum: PaymentTerms, default: PaymentTerms.NET_30 })
  paymentTerms: PaymentTerms;

  @Prop({ required: true, type: Number })
  creditLimit: number;

  @Prop({ type: Number, default: 0 })
  currentBalance: number;

  @Prop({ type: Number, default: 0 })
  availableCredit: number;

  @Prop({ type: Number, default: 0 })
  pastDueAmount: number;

  @Prop()
  lastPaymentDate: Date;

  @Prop({ type: Number, default: 0 })
  lastPaymentAmount: number;

  // Restrictions
  @Prop({ type: [String], default: [] })
  allowedProducts: string[]; // Product categories allowed

  @Prop({ type: [String], default: [] })
  restrictedProducts: string[]; // Product categories restricted

  @Prop({ type: [Types.ObjectId], ref: 'Location', default: [] })
  allowedLocations: Types.ObjectId[]; // Specific locations allowed

  @Prop({ type: Number })
  maxTransactionAmount: number;

  @Prop({ type: Number })
  dailySpendLimit: number;

  @Prop({ default: false })
  requireOdometer: boolean;

  @Prop({ default: false })
  requireDriverId: boolean;

  @Prop({ default: false })
  fuelOnly: boolean;

  // Vehicles and drivers
  @Prop({ type: [FleetVehicle], default: [] })
  vehicles: FleetVehicle[];

  @Prop({ type: [FleetDriver], default: [] })
  drivers: FleetDriver[];

  @Prop({ type: [FleetCard], default: [] })
  cards: FleetCard[];

  // Billing
  @Prop({ default: 1 })
  billingDayOfMonth: number; // Day of month to generate invoice

  @Prop({ default: false })
  emailInvoice: boolean;

  @Prop()
  invoiceEmail: string;

  // Performance metrics
  @Prop({ type: Number, default: 0 })
  totalSpent: number;

  @Prop({ type: Number, default: 0 })
  thisMonthSpent: number;

  @Prop({ type: Number, default: 0 })
  thisYearSpent: number;

  @Prop()
  accountOpenDate: Date;

  @Prop({ type: Number, default: 0 })
  totalTransactions: number;

  // Notes and status
  @Prop()
  notes: string;

  @Prop()
  suspensionReason: string;

  @Prop()
  closureReason: string;

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop()
  approvalDate: Date;
}

export const FleetAccountSchema = SchemaFactory.createForClass(FleetAccount);

// Indexes
FleetAccountSchema.index({ accountNumber: 1 }, { unique: true });
FleetAccountSchema.index({ companyName: 1 });
FleetAccountSchema.index({ status: 1 });
FleetAccountSchema.index({ currentBalance: -1 });
FleetAccountSchema.index({ 'cards.cardNumber': 1 });
