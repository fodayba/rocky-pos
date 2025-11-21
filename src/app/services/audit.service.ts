import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  flagged: boolean;
  flagReason?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/audit`;

  private logsSignal = signal<AuditLog[]>([]);
  readonly logs = this.logsSignal.asReadonly();

  async loadLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    resource?: string;
    severity?: string;
  }) {
    const params: any = {};
    if (filters?.startDate) params.startDate = filters.startDate.toISOString();
    if (filters?.endDate) params.endDate = filters.endDate.toISOString();
    if (filters?.userId) params.userId = filters.userId;
    if (filters?.resource) params.resource = filters.resource;
    if (filters?.severity) params.severity = filters.severity;

    const logs = await firstValueFrom(
      this.http.get<AuditLog[]>(this.apiUrl, { params })
    );
    this.logsSignal.set(logs);
    return logs;
  }

  async getUserLogs(userId: string) {
    return firstValueFrom(this.http.get<AuditLog[]>(`${this.apiUrl}/user/${userId}`));
  }

  async getResourceLogs(resource: string, resourceId: string) {
    return firstValueFrom(
      this.http.get<AuditLog[]>(`${this.apiUrl}/resource/${resource}/${resourceId}`)
    );
  }

  async getSecurityEvents() {
    return firstValueFrom(
      this.http.get<AuditLog[]>(`${this.apiUrl}/security-events`)
    );
  }

  async getFlaggedLogs() {
    return firstValueFrom(this.http.get<AuditLog[]>(`${this.apiUrl}/flagged`));
  }
}
