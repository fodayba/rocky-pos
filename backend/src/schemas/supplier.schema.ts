import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SupplierType {
  FUEL = 'fuel',
  MERCHANDISE = 'merchandise',
  BOTH = 'both',
  SERVICE = 'service',
}

export enum PaymentTerms {
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  COD = 'cod',
  PREPAID = 'prepaid',
}

@Schema({ timestamps: true })
export class Supplier extends Document {
  @Prop({ required: true, unique: true })
  supplierCode: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: SupplierType, required: true })
  type: SupplierType;

  // Contact information
  @Prop({ required: true })
  contactPerson: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  fax: string;

  @Prop()
  website: string;

  // Address
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ default: 'USA' })
  country: string;

  // Business information
  @Prop()
  taxId: string;

  @Prop({ type: String, enum: PaymentTerms, default: PaymentTerms.NET_30 })
  paymentTerms: PaymentTerms;

  @Prop({ type: Number, default: 0 })
  creditLimit: number;

  @Prop({ type: Number, default: 0 })
  currentBalance: number;

  // Delivery information
  @Prop()
  deliverySchedule: string; // e.g., "Monday, Thursday"

  @Prop({ type: Number })
  minimumOrderAmount: number;

  @Prop({ type: Number, default: 0 })
  leadTimeDays: number;

  // Performance metrics
  @Prop({ type: Number, default: 0 })
  totalPurchases: number;

  @Prop()
  lastOrderDate: Date;

  @Prop()
  lastDeliveryDate: Date;

  @Prop({ type: Number, default: 100 })
  onTimeDeliveryRate: number; // Percentage

  @Prop({ type: Number, default: 100 })
  qualityRating: number; // 0-100

  // Status
  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  preferred: boolean; // Preferred supplier

  @Prop()
  notes: string;

  @Prop({ type: [String], default: [] })
  productCategories: string[]; // Categories this supplier provides

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

// Indexes
SupplierSchema.index({ supplierCode: 1 });
SupplierSchema.index({ name: 1 });
SupplierSchema.index({ type: 1 });
SupplierSchema.index({ active: 1 });
