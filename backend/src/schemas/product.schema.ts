import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  // Location reference - products are now location-specific
  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;

  @Prop({ required: true })
  barcode: string; // Unique per location (see compound index below)

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  cost: number;

  @Prop({ required: true, type: Number, default: 0 })
  stockQuantity: number;

  @Prop({ required: true, type: Number, default: 10 })
  minStockLevel: number;

  @Prop({ required: true, type: Number, default: 0 })
  reorderQuantity: number; // Quantity to reorder when stock is low

  @Prop({ required: true })
  unit: string;

  @Prop({ type: Types.ObjectId, ref: 'Supplier' })
  supplier: Types.ObjectId; // Changed to reference Supplier schema

  @Prop({ default: true })
  taxable: boolean;

  @Prop({ type: Number, default: 0.08 })
  taxRate: number; // Can be overridden by location tax settings

  @Prop()
  imageUrl: string;

  // Age restriction for tobacco, alcohol, etc.
  @Prop({ default: false })
  ageRestricted: boolean;

  @Prop({ type: Number })
  minimumAge: number; // 18, 21, etc.

  // Product status
  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  discontinued: boolean;

  // For tracking batches/lots
  @Prop()
  lotNumber: string;

  @Prop()
  expirationDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Create compound index: barcode must be unique per location
ProductSchema.index({ locationId: 1, barcode: 1 }, { unique: true });
ProductSchema.index({ locationId: 1, category: 1 });
ProductSchema.index({ locationId: 1, active: 1 });
ProductSchema.index({ locationId: 1, stockQuantity: 1 });
