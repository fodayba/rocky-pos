import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ShiftType {
  OPENING = 'opening',
  MID = 'mid',
  CLOSING = 'closing',
  OVERNIGHT = 'overnight',
  SPLIT = 'split',
}

export class ScheduledShift {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employeeId: Types.ObjectId;

  @Prop()
  employeeName: string;

  @Prop({ required: true, type: Date })
  startTime: Date;

  @Prop({ required: true, type: Date })
  endTime: Date;

  @Prop({ type: String, enum: ShiftType })
  shiftType: ShiftType;

  @Prop()
  position: string;

  @Prop({ type: Number })
  breakDuration: number; // Minutes

  @Prop()
  notes: string;

  @Prop({ default: false })
  callOff: boolean;

  @Prop()
  callOffReason: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  replacementEmployeeId: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Schedule extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;

  @Prop({ required: true })
  weekStartDate: Date;

  @Prop({ required: true })
  weekEndDate: Date;

  @Prop({ type: [ScheduledShift], default: [] })
  shifts: ScheduledShift[];

  @Prop({ default: 'draft' })
  status: string; // draft, published, finalized

  @Prop()
  publishedDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  publishedBy: Types.ObjectId;

  @Prop()
  notes: string;

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

ScheduleSchema.index({ locationId: 1, weekStartDate: 1 }, { unique: true });
ScheduleSchema.index({ 'shifts.employeeId': 1 });
