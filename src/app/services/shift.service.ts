import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Shift, ShiftSummary } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/shifts`;

  private shiftsSignal = signal<Shift[]>([]);
  private currentShiftSignal = signal<Shift | null>(null);

  public readonly shifts = this.shiftsSignal.asReadonly();
  public readonly currentShift = this.currentShiftSignal.asReadonly();
  public readonly hasActiveShift = computed(() => this.currentShiftSignal() !== null);

  findAll(): Observable<Shift[]> {
    return this.http.get<Shift[]>(this.apiUrl).pipe(
      tap(shifts => this.shiftsSignal.set(shifts))
    );
  }

  findOne(id: string): Observable<Shift> {
    return this.http.get<Shift>(`${this.apiUrl}/${id}`);
  }

  getCurrentShift(): Observable<Shift | null> {
    return this.http.get<Shift | null>(`${this.apiUrl}/current`).pipe(
      tap(shift => this.currentShiftSignal.set(shift))
    );
  }

  getCurrentShiftSummary(): Observable<ShiftSummary | null> {
    return this.http.get<ShiftSummary | null>(`${this.apiUrl}/current/summary`);
  }

  openShift(cashierId: string, cashierName: string, openingCash: number): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/open`, { cashierId, cashierName, openingCash }).pipe(
      tap(shift => {
        this.currentShiftSignal.set(shift);
        this.findAll().subscribe();
      })
    );
  }

  closeShift(actualCash: number, notes?: string): Observable<Shift> {
    const currentShift = this.currentShiftSignal();
    if (!currentShift) {
      throw new Error('No active shift to close');
    }
    return this.http.post<Shift>(`${this.apiUrl}/${currentShift.id}/close`, { actualCash, notes }).pipe(
      tap(() => {
        this.currentShiftSignal.set(null);
        this.findAll().subscribe();
      })
    );
  }
}
