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
  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CASHIER, type: String })
  role: UserRole;

  @Prop({ required: true, type: String })
  fullName: string;

  @Prop({ required: true, type: String })
  firstName: string;

  @Prop({ required: true, type: String })
  lastName: string;

  // Location assignment - users can be assigned to multiple locations
  @Prop({ type: [Types.ObjectId], ref: 'Location', default: [] })
  assignedLocations: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  primaryLocation: Types.ObjectId; // Main location for the user

  // Contact information
  @Prop({ type: String })
  phone: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  state: string;

  @Prop({ type: String })
  zipCode: string;

  // Employee details
  @Prop({ type: String })
  employeeId: string;

  @Prop({ type: Date })
  hireDate: Date;

  @Prop({ type: Date })
  terminationDate: Date;

  @Prop({ type: Number })
  hourlyRate: number;

  @Prop({ type: String })
  jobTitle: string;

  // Emergency contact
  @Prop({ type: String })
  emergencyContactName: string;

  @Prop({ type: String })
  emergencyContactPhone: string;

  @Prop({ type: String })
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
  @Prop({ default: true, type: Boolean })
  active: boolean;

  @Prop({ default: false, type: Boolean })
  isSuspended: boolean;

  @Prop({ type: String })
  suspensionReason: string;

  // PIN for POS login (in addition to email/password)
  @Prop({ type: String })
  pin: string; // Hashed 4-6 digit PIN

  // Last login tracking
  @Prop({ type: Date })
  lastLogin: Date;

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  lastLoginLocation: Types.ObjectId;

  // Certifications (for age-restricted sales, etc.)
  @Prop({ type: [String], default: [] })
  certifications: string[]; // e.g., ['alcohol_sales', 'tobacco_sales', 'lottery']

  @Prop({ type: Date })
  certificationsExpiry: Date;

  // Onboarding tracking
  @Prop({ default: false, type: Boolean })
  onboardingCompleted: boolean;

  @Prop({ type: Date })
  onboardingCompletedAt: Date;

  @Prop({
    type: Object,
    default: {
      welcomeViewed: false,
      locationSetup: false,
      completionViewed: false,
    },
  })
  onboardingProgress: {
    welcomeViewed: boolean;
    locationSetup: boolean;
    completionViewed: boolean;
  };

  // User preferences
  @Prop({ default: 'en-US', type: String })
  locale: string;

  @Prop({
    type: Object,
    default: {
      theme: 'system',
      displayDensity: 'comfortable',
      rememberMe: false,
      sessionTimeout: 3600,
    },
  })
  preferences: {
    theme: string;
    displayDensity: string;
    rememberMe: boolean;
    sessionTimeout: number;
  };

  @Prop({
    type: Object,
    default: {
      email: { sales: true, inventory: true, system: true, security: true },
      inApp: { sales: true, inventory: true, system: true, security: true },
    },
  })
  notificationPreferences: {
    email: {
      sales: boolean;
      inventory: boolean;
      system: boolean;
      security: boolean;
    };
    inApp: {
      sales: boolean;
      inventory: boolean;
      system: boolean;
      security: boolean;
    };
  };

  @Prop({ type: Date })
  lastPasswordChange: Date;

  @Prop({ type: String })
  lastLoginIp: string;

  @Prop({ default: false, type: Boolean })
  markedForDeletion: boolean;

  @Prop({ type: Date })
  deletionScheduledFor: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ employeeId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ assignedLocations: 1 });
