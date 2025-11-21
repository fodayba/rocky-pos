import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Shift } from '../models';
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

  openShift(openingCash: number, registerNumber: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/open`, { openingCash, registerNumber }).pipe(
      tap(shift => {
        this.currentShiftSignal.set(shift);
        this.findAll().subscribe();
      })
    );
  }

  closeShift(id: string, actualCash: number, notes?: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/${id}/close`, { actualCash, notes }).pipe(
      tap(() => {
        this.currentShiftSignal.set(null);
        this.findAll().subscribe();
      })
    );
  }
}
