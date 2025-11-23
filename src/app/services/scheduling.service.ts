import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Shift,
  CreateShiftDto,
  UpdateShiftDto,
  ScheduleStatistics
} from '../models/schedule.model';

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/schedules`;

  private shiftsSignal = signal<Shift[]>([]);
  readonly shifts = this.shiftsSignal.asReadonly();

  findAll(filters?: any): Observable<Shift[]> {
    return this.http.get<Shift[]>(this.apiUrl, { params: filters }).pipe(
      tap(shifts => this.shiftsSignal.set(shifts))
    );
  }

  findOne(id: string): Observable<Shift> {
    return this.http.get<Shift>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateShiftDto): Observable<Shift> {
    return this.http.post<Shift>(this.apiUrl, dto).pipe(
      tap(shift => {
        this.shiftsSignal.update(shifts => [...shifts, shift]);
      })
    );
  }

  update(id: string, dto: UpdateShiftDto): Observable<Shift> {
    return this.http.patch<Shift>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updated => {
        this.shiftsSignal.update(shifts =>
          shifts.map(s => s._id === id ? updated : s)
        );
      })
    );
  }

  cancel(id: string, reason: string): Observable<Shift> {
    return this.http.patch<Shift>(`${this.apiUrl}/${id}/cancel`, { reason }).pipe(
      tap(updated => {
        this.shiftsSignal.update(shifts =>
          shifts.map(s => s._id === id ? updated : s)
        );
      })
    );
  }

  markNoShow(id: string): Observable<Shift> {
    return this.http.patch<Shift>(`${this.apiUrl}/${id}/no-show`, {}).pipe(
      tap(updated => {
        this.shiftsSignal.update(shifts =>
          shifts.map(s => s._id === id ? updated : s)
        );
      })
    );
  }

  requestSwap(id: string, requestedById: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/${id}/swap-request`, { requestedById }).pipe(
      tap(updated => {
        this.shiftsSignal.update(shifts =>
          shifts.map(s => s._id === id ? updated : s)
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.shiftsSignal.update(shifts => shifts.filter(s => s._id !== id));
      })
    );
  }

  getStatistics(): Observable<ScheduleStatistics> {
    return this.http.get<ScheduleStatistics>(`${this.apiUrl}/statistics`);
  }
}
