import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ASSISTANT_MANAGER = 'assistant_manager',
  SHIFT_SUPERVISOR = 'shift_supervisor',
  CASHIER = 'cashier',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CASHIER })
  role: UserRole;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  // Location assignment - users can be assigned to multiple locations
  @Prop({ type: [Types.ObjectId], ref: 'Location', default: [] })
  assignedLocations: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  primaryLocation: Types.ObjectId; // Main location for the user

  // Contact information
  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zipCode: string;

  // Employee details
  @Prop()
  employeeId: string;

  @Prop()
  hireDate: Date;

  @Prop()
  terminationDate: Date;

  @Prop({ type: Number })
  hourlyRate: number;

  @Prop()
  jobTitle: string;

  // Emergency contact
  @Prop()
  emergencyContactName: string;

  @Prop()
  emergencyContactPhone: string;

  @Prop()
  emergencyContactRelationship: string;

  // Permissions - granular permissions beyond role
  @Prop({ type: [String], default: [] })
  permissions: string[]; // e.g., ['void_transactions', 'apply_discounts', 'refund_cash']

  // Transaction limits
  @Prop({ type: Number })
  maxDiscountPercent: number;

  @Prop({ type: Number })
  maxTransactionAmount: number;

  @Prop({ type: Number })
  maxCashRefund: number;

  // Status
  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  isSuspended: boolean;

  @Prop()
  suspensionReason: string;

  // PIN for POS login (in addition to email/password)
  @Prop()
  pin: string; // Hashed 4-6 digit PIN

  // Last login tracking
  @Prop()
  lastLogin: Date;

  @Prop()
  lastLoginLocation: Types.ObjectId;

  // Certifications (for age-restricted sales, etc.)
  @Prop({ type: [String], default: [] })
  certifications: string[]; // e.g., ['alcohol_sales', 'tobacco_sales', 'lottery']

  @Prop()
  certificationsExpiry: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ employeeId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ assignedLocations: 1 });
