import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop({ type: Number, default: 0 })
  loyaltyPoints: number;

  @Prop({ type: Number, default: 0 })
  totalSpent: number;

  @Prop({ type: Number, default: 0 })
  visitCount: number;

  @Prop({ type: Date })
  lastVisit: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
