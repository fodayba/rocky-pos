import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TimeEntryStatus {
  ACTIVE = 'active', // Currently clocked in
  COMPLETED = 'completed',
  APPROVED = 'approved',
  DISPUTED = 'disputed',
}

export class BreakPeriod {
  @Prop({ required: true, type: Date })
  start: Date;

  @Prop({ type: Date })
  end: Date;

  @Prop({ type: Number })
  duration: number; // Minutes

  @Prop({ default: false })
  paid: boolean;
}

@Schema({ timestamps: true })
export class TimeEntry extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employeeId: Types.ObjectId;

  @Prop()
  employeeName: string;

  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  clockIn: Date;

  @Prop({ type: Date })
  clockOut: Date;

  @Prop({ type: [BreakPeriod], default: [] })
  breaks: BreakPeriod[];

  @Prop({ type: Number })
  totalBreakMinutes: number;

  @Prop({ type: Number })
  totalHours: number;

  @Prop({ type: Number })
  regularHours: number;

  @Prop({ type: Number })
  overtimeHours: number;

  @Prop({ type: Number })
  hourlyRate: number;

  @Prop({ type: Number })
  grossPay: number;

  @Prop({ type: String, enum: TimeEntryStatus, default: TimeEntryStatus.ACTIVE })
  status: TimeEntryStatus;

  // Clock in/out methods
  @Prop()
  clockInMethod: string; // 'pos', 'web', 'mobile', 'biometric'

  @Prop()
  clockOutMethod: string;

  @Prop()
  clockInIpAddress: string;

  @Prop()
  clockOutIpAddress: string;

  // Manager approval
  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop()
  approvalDate: Date;

  // Adjustments
  @Prop({ default: false })
  adjusted: boolean;

  @Prop()
  adjustmentReason: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  adjustedBy: Types.ObjectId;

  @Prop()
  originalClockIn: Date;

  @Prop()
  originalClockOut: Date;

  // Shift reference
  @Prop({ type: Types.ObjectId, ref: 'Shift' })
  shiftId: Types.ObjectId;

  @Prop()
  notes: string;

  // Audit
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const TimeEntrySchema = SchemaFactory.createForClass(TimeEntry);

TimeEntrySchema.index({ employeeId: 1, clockIn: -1 });
TimeEntrySchema.index({ locationId: 1, clockIn: -1 });
TimeEntrySchema.index({ status: 1 });
TimeEntrySchema.index({ clockIn: 1, clockOut: 1 });
