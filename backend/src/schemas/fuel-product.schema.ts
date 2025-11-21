import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum FuelType {
  REGULAR = 'regular',
  PREMIUM = 'premium',
  DIESEL = 'diesel',
}

@Schema({ timestamps: true })
export class FuelProduct extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: FuelType })
  type: FuelType;

  @Prop({ required: true, type: Number })
  pricePerGallon: number;

  @Prop({ required: true, type: Number, default: 0 })
  currentStock: number;

  @Prop({ required: true, type: Number })
  tankCapacity: number;

  @Prop({ required: true, type: Number })
  minLevel: number;

  @Prop({ type: Date })
  lastDelivery: Date;

  @Prop({ type: Number })
  lastDeliveryAmount: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const FuelProductSchema = SchemaFactory.createForClass(FuelProduct);
