import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuditLog,
  AuditLogFilters,
  AuditLogStatistics
} from '../models/audit-log.model';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/audit`;

  private logsSignal = signal<AuditLog[]>([]);
  readonly logs = this.logsSignal.asReadonly();

  findAll(filters?: AuditLogFilters): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl, { params: filters as any }).pipe(
      tap(logs => this.logsSignal.set(logs))
    );
  }

  findOne(id: string): Observable<AuditLog> {
    return this.http.get<AuditLog>(`${this.apiUrl}/${id}`);
  }

  findByUser(userId: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/user/${userId}`);
  }

  findByEntity(entity: string, entityId: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/entity/${entity}/${entityId}`);
  }

  getStatistics(): Observable<AuditLogStatistics> {
    return this.http.get<AuditLogStatistics>(`${this.apiUrl}/statistics`);
  }

  exportLogs(filters?: AuditLogFilters): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export`, filters, {
      responseType: 'blob'
    });
  }
}
