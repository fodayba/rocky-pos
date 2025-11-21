import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ShiftStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Schema({ timestamps: true })
export class Shift extends Document {
  @Prop({ required: true, unique: true })
  shiftNumber: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ required: true, type: Date })
  startTime: Date;

  @Prop({ type: Date })
  endTime: Date;

  @Prop({ required: true, type: Number })
  openingCash: number;

  @Prop({ type: Number })
  closingCash: number;

  @Prop({ type: Number })
  expectedCash: number;

  @Prop({ type: Number })
  cashVariance: number;

  @Prop({ required: true })
  registerNumber: string;

  @Prop({ required: true, enum: ShiftStatus, default: ShiftStatus.OPEN })
  status: ShiftStatus;

  @Prop()
  notes: string;
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);
