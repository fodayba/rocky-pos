import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ScheduleShift {
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  position: string;
  isCallOff: boolean;
  callOffReason?: string;
  replacementEmployeeId?: string;
}

export interface Schedule {
  _id: string;
  locationId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  status: 'draft' | 'published' | 'finalized';
  shifts: ScheduleShift[];
  totalScheduledHours: number;
  notes?: string;
  createdBy: string;
  publishedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/schedules`;

  private schedulesSignal = signal<Schedule[]>([]);
  readonly schedules = this.schedulesSignal.asReadonly();

  async loadSchedules() {
    const schedules = await firstValueFrom(this.http.get<Schedule[]>(this.apiUrl));
    this.schedulesSignal.set(schedules);
    return schedules;
  }

  async getSchedule(id: string) {
    return firstValueFrom(this.http.get<Schedule>(`${this.apiUrl}/${id}`));
  }

  async getWeekSchedule(locationId: string, weekStartDate: Date) {
    return firstValueFrom(
      this.http.get<Schedule>(
        `${this.apiUrl}/week/${locationId}/${weekStartDate.toISOString()}`
      )
    );
  }

  async createSchedule(schedule: Partial<Schedule>) {
    const newSchedule = await firstValueFrom(
      this.http.post<Schedule>(this.apiUrl, schedule)
    );
    this.schedulesSignal.update((schedules) => [...schedules, newSchedule]);
    return newSchedule;
  }

  async updateSchedule(id: string, updates: Partial<Schedule>) {
    const updated = await firstValueFrom(
      this.http.patch<Schedule>(`${this.apiUrl}/${id}`, updates)
    );
    this.schedulesSignal.update((schedules) =>
      schedules.map((s) => (s._id === id ? updated : s))
    );
    return updated;
  }

  async addShift(id: string, shift: ScheduleShift) {
    return firstValueFrom(
      this.http.post<Schedule>(`${this.apiUrl}/${id}/shifts`, shift)
    );
  }

  async updateShift(id: string, shiftIndex: number, shift: Partial<ScheduleShift>) {
    return firstValueFrom(
      this.http.patch<Schedule>(`${this.apiUrl}/${id}/shifts/${shiftIndex}`, shift)
    );
  }

  async recordCallOff(id: string, shiftIndex: number, reason: string) {
    return firstValueFrom(
      this.http.post<Schedule>(`${this.apiUrl}/${id}/shifts/${shiftIndex}/call-off`, {
        reason,
      })
    );
  }

  async publishSchedule(id: string) {
    return firstValueFrom(
      this.http.post<Schedule>(`${this.apiUrl}/${id}/publish`, {})
    );
  }
}
