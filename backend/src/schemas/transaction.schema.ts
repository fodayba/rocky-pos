import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransactionType {
  SALE = 'sale',
  RETURN = 'return',
  VOID = 'void',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile',
}

export class TransactionItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Number })
  unitPrice: number;

  @Prop({ required: true, type: Number })
  subtotal: number;

  @Prop({ default: false })
  isFuel: boolean;

  @Prop({ type: Number })
  fuelGallons: number;
}

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true, unique: true })
  transactionNumber: string;

  @Prop({ required: true, enum: TransactionType, default: TransactionType.SALE })
  type: TransactionType;

  @Prop({ type: [TransactionItem], default: [] })
  items: TransactionItem[];

  @Prop({ required: true, type: Number })
  subtotal: number;

  @Prop({ required: true, type: Number })
  tax: number;

  @Prop({ required: true, type: Number })
  total: number;

  @Prop({ required: true, enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Prop({ type: Number })
  cashReceived: number;

  @Prop({ type: Number })
  changeGiven: number;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  cashierId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Shift' })
  shiftId: Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
