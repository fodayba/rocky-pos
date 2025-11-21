import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditAction, AuditSeverity } from '../schemas/audit-log.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async log(data: {
    userId?: string;
    userEmail?: string;
    userName?: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    locationId?: string;
    severity?: AuditSeverity;
    description?: string;
    beforeValue?: any;
    afterValue?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    success?: boolean;
    errorMessage?: string;
    metadata?: any;
    tags?: string[];
  }): Promise<AuditLog> {
    const auditLog = new this.auditLogModel({
      ...data,
      severity: data.severity || AuditSeverity.LOW,
      success: data.success !== false,
    });

    return auditLog.save();
  }

  async findAll(filters?: any): Promise<AuditLog[]> {
    const query = this.buildQuery(filters);
    return this.auditLogModel
      .find(query)
      .populate('userId', 'fullName email')
      .populate('locationId', 'name storeNumber')
      .sort({ createdAt: -1 })
      .limit(filters?.limit || 100)
      .exec();
  }

  async findByUser(userId: string, limit = 100): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByResource(resource: string, resourceId: string): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ resource, resourceId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findSecurityEvents(): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({
        $or: [
          { action: AuditAction.LOGIN_FAILED },
          { severity: AuditSeverity.CRITICAL },
          { tags: 'security' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  async findFlaggedForReview(): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ flaggedForReview: true, reviewedAt: null })
      .sort({ createdAt: -1 })
      .exec();
  }

  private buildQuery(filters: any = {}): any {
    const query: any = {};
    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.resource) query.resource = filters.resource;
    if (filters.severity) query.severity = filters.severity;
    if (filters.locationId) query.locationId = filters.locationId;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }
    return query;
  }
}
