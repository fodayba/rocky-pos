import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, unique: true })
  barcode: string;

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

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  supplier: string;

  @Prop({ default: true })
  taxable: boolean;

  @Prop({ type: Number, default: 0.08 })
  taxRate: number;

  @Prop()
  imageUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
