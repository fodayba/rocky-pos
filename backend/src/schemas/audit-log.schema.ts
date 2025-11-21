import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PRICE_CHANGE = 'price_change',
  VOID_TRANSACTION = 'void_transaction',
  REFUND = 'refund',
  DISCOUNT_APPLIED = 'discount_applied',
  MANAGER_OVERRIDE = 'manager_override',
  CASH_DROP = 'cash_drop',
  SHIFT_OPEN = 'shift_open',
  SHIFT_CLOSE = 'shift_close',
  INVENTORY_ADJUSTMENT = 'inventory_adjustment',
  PERMISSION_CHANGE = 'permission_change',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  LOCATION_CREATED = 'location_created',
  LOCATION_UPDATED = 'location_updated',
  SYSTEM_CONFIG_CHANGE = 'system_config_change',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Location' })
  locationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  userEmail: string;

  @Prop()
  userName: string;

  @Prop({ required: true, enum: AuditAction })
  action: AuditAction;

  @Prop({ required: true })
  resource: string; // e.g., 'Transaction', 'Product', 'User'

  @Prop()
  resourceId: string; // ID of the resource affected

  @Prop({ type: String, enum: AuditSeverity, default: AuditSeverity.LOW })
  severity: AuditSeverity;

  @Prop()
  description: string; // Human-readable description

  // Before/After values for updates
  @Prop({ type: Object })
  beforeValue: any;

  @Prop({ type: Object })
  afterValue: any;

  // Request metadata
  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  sessionId: string;

  // Result
  @Prop({ default: true })
  success: boolean;

  @Prop()
  errorMessage: string;

  // Additional context
  @Prop({ type: Object })
  metadata: any; // Additional data specific to the action

  @Prop({ type: [String], default: [] })
  tags: string[]; // For filtering: 'security', 'financial', 'compliance'

  // For compliance
  @Prop({ default: false })
  flaggedForReview: boolean;

  @Prop()
  reviewedBy: Types.ObjectId;

  @Prop()
  reviewedAt: Date;

  @Prop()
  reviewNotes: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes for efficient querying
AuditLogSchema.index({ createdAt: -1 }); // Time-based queries
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ locationId: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ severity: 1 });
AuditLogSchema.index({ flaggedForReview: 1 });
AuditLogSchema.index({ tags: 1 });
