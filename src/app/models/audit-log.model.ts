export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  APPROVE = 'approve',
  REJECT = 'reject',
  SEND = 'send',
  RECEIVE = 'receive',
  CANCEL = 'cancel',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  SUSPEND = 'suspend',
  EXPORT = 'export',
  IMPORT = 'import',
  PAYMENT = 'payment',
  REFUND = 'refund',
}

export enum AuditEntity {
  USER = 'user',
  CUSTOMER = 'customer',
  PRODUCT = 'product',
  INVENTORY = 'inventory',
  TRANSACTION = 'transaction',
  PURCHASE_ORDER = 'purchase_order',
  SUPPLIER = 'supplier',
  FLEET_ACCOUNT = 'fleet_account',
  GIFT_CARD = 'gift_card',
  PROMOTION = 'promotion',
  TIME_ENTRY = 'time_entry',
  SHIFT = 'shift',
  INVOICE = 'invoice',
  REPORT = 'report',
}

export interface AuditLog {
  _id: string;
  entity: AuditEntity;
  entityId?: string;
  action: AuditAction;
  userId: string;
  userName: string;
  userEmail?: string;
  userRole?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  locationId?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export interface AuditLogFilters {
  entity?: AuditEntity;
  action?: AuditAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: string;
  search?: string;
}

export interface AuditLogStatistics {
  totalLogs: number;
  todayLogs: number;
  weekLogs: number;
  monthLogs: number;
  topUsers: { userId: string; userName: string; count: number }[];
  topActions: { action: AuditAction; count: number }[];
  topEntities: { entity: AuditEntity; count: number }[];
}
