import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { TimeEntry, ClockInDto, ClockOutDto, TimeEntryStatus } from '../models/time-entry.model';

@Injectable({
  providedIn: 'root',
})
export class TimeTrackingService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/time-tracking`;

  private activeEntrySignal = signal<TimeEntry | null>(null);
  readonly activeEntry = this.activeEntrySignal.asReadonly();

  clockIn(dto: ClockInDto): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.apiUrl}/clock-in`, dto).pipe(
      tap(entry => this.activeEntrySignal.set(entry))
    );
  }

  clockOut(entryId: string, dto: ClockOutDto): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.apiUrl}/${entryId}/clock-out`, dto).pipe(
      tap(() => this.activeEntrySignal.set(null))
    );
  }

  getActiveEntry(employeeId: string): Observable<TimeEntry | null> {
    return this.http.get<TimeEntry | null>(`${this.apiUrl}/active/${employeeId}`).pipe(
      tap(entry => this.activeEntrySignal.set(entry))
    );
  }

  getMyEntries(startDate?: string, endDate?: string): Observable<TimeEntry[]> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<TimeEntry[]>(`${this.apiUrl}/my-entries`, { params });
  }

  getAllEntries(filters?: any): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(this.apiUrl, { params: filters });
  }

  approve(entryId: string): Observable<TimeEntry> {
    return this.http.patch<TimeEntry>(`${this.apiUrl}/${entryId}/approve`, {});
  }

  adjust(entryId: string, adjustments: any): Observable<TimeEntry> {
    return this.http.patch<TimeEntry>(`${this.apiUrl}/${entryId}/adjust`, adjustments);
  }
}
