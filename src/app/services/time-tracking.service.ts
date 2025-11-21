import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TimeEntry {
  _id: string;
  employeeId: string;
  locationId: string;
  clockInTime: Date;
  clockOutTime?: Date;
  breakStartTime?: Date;
  breakEndTime?: Date;
  totalBreakMinutes: number;
  totalHoursWorked?: number;
  status: 'clocked_in' | 'on_break' | 'clocked_out' | 'approved' | 'disputed';
  adjustedBy?: string;
  adjustmentReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class TimeTrackingService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/time-tracking`;

  private entriesSignal = signal<TimeEntry[]>([]);
  readonly entries = this.entriesSignal.asReadonly();

  private currentEntrySignal = signal<TimeEntry | null>(null);
  readonly currentEntry = this.currentEntrySignal.asReadonly();

  async clockIn(locationId: string) {
    const entry = await firstValueFrom(
      this.http.post<TimeEntry>(`${this.apiUrl}/clock-in`, { locationId })
    );
    this.currentEntrySignal.set(entry);
    return entry;
  }

  async clockOut() {
    const entry = await firstValueFrom(
      this.http.post<TimeEntry>(`${this.apiUrl}/clock-out`, {})
    );
    this.currentEntrySignal.set(null);
    return entry;
  }

  async startBreak() {
    const entry = await firstValueFrom(
      this.http.post<TimeEntry>(`${this.apiUrl}/break/start`, {})
    );
    this.currentEntrySignal.set(entry);
    return entry;
  }

  async endBreak(breakType: 'paid' | 'unpaid') {
    const entry = await firstValueFrom(
      this.http.post<TimeEntry>(`${this.apiUrl}/break/end`, { breakType })
    );
    this.currentEntrySignal.set(entry);
    return entry;
  }

  async getCurrentEntry() {
    const entry = await firstValueFrom(
      this.http.get<TimeEntry>(`${this.apiUrl}/current`)
    );
    this.currentEntrySignal.set(entry);
    return entry;
  }

  async loadEntries(employeeId?: string) {
    const url = employeeId
      ? `${this.apiUrl}/employee/${employeeId}`
      : `${this.apiUrl}/my-entries`;
    const entries = await firstValueFrom(this.http.get<TimeEntry[]>(url));
    this.entriesSignal.set(entries);
    return entries;
  }

  async adjustTimeEntry(id: string, adjustments: Partial<TimeEntry>) {
    return firstValueFrom(
      this.http.patch<TimeEntry>(`${this.apiUrl}/${id}/adjust`, adjustments)
    );
  }

  async approveTimeEntry(id: string) {
    return firstValueFrom(
      this.http.post<TimeEntry>(`${this.apiUrl}/${id}/approve`, {})
    );
  }

  async getSummary(employeeId: string, startDate: Date, endDate: Date) {
    return firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/summary/${employeeId}`, {
        params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      })
    );
  }
}
