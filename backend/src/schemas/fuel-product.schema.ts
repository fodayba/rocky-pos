import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum FuelType {
  REGULAR = 'regular',
  MIDGRADE = 'midgrade',
  PREMIUM = 'premium',
  DIESEL = 'diesel',
  E85 = 'e85',
  KEROSENE = 'kerosene',
  DEF = 'def', // Diesel Exhaust Fluid
}

@Schema({ timestamps: true })
export class FuelProduct extends Document {
  // Location reference
  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: FuelType })
  type: FuelType;

  // Pricing
  @Prop({ required: true, type: Number })
  pricePerGallon: number;

  @Prop({ type: Number })
  cashPricePerGallon: number; // Different price for cash vs credit

  @Prop({ type: Number })
  cost: number; // Cost per gallon for margin calculations

  // Stock/Tank Information
  @Prop({ required: true, type: Number, default: 0 })
  currentStock: number; // Current gallons in tank

  @Prop({ required: true, type: Number })
  tankCapacity: number; // Total tank capacity in gallons

  @Prop({ required: true, type: Number })
  minLevel: number; // Minimum level before reorder

  @Prop({ type: Number, default: 0 })
  reorderLevel: number; // Level at which to automatically reorder

  // Tank identification
  @Prop()
  tankNumber: string; // Physical tank identifier

  @Prop({ type: Types.ObjectId, ref: 'Tank' })
  tankId: Types.ObjectId; // Reference to detailed Tank schema (for advanced fuel management)

  // Delivery tracking
  @Prop({ type: Date })
  lastDelivery: Date;

  @Prop({ type: Number })
  lastDeliveryAmount: number;

  @Prop()
  nextScheduledDelivery: Date;

  @Prop({ type: Types.ObjectId, ref: 'Supplier' })
  supplier: Types.ObjectId;

  // Sales tracking (cached for performance)
  @Prop({ type: Number, default: 0 })
  todayGallonsSold: number;

  @Prop({ type: Number, default: 0 })
  weekGallonsSold: number;

  @Prop({ type: Number, default: 0 })
  monthGallonsSold: number;

  @Prop()
  lastSalesUpdate: Date;

  // Status
  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  outOfStock: boolean;

  @Prop()
  outOfStockSince: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const FuelProductSchema = SchemaFactory.createForClass(FuelProduct);

// Indexes for better query performance
FuelProductSchema.index({ locationId: 1, type: 1 }, { unique: true }); // One fuel type per location
FuelProductSchema.index({ locationId: 1, active: 1 });
FuelProductSchema.index({ currentStock: 1 });
