import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { TaxRate, CreateTaxRateDto, UpdateTaxRateDto, TaxStatistics } from '../models/tax.model';

@Injectable({
  providedIn: 'root',
})
export class TaxService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tax`;

  private taxRatesSignal = signal<TaxRate[]>([]);
  readonly taxRates = this.taxRatesSignal.asReadonly();

  findAll(filters?: any): Observable<TaxRate[]> {
    return this.http.get<TaxRate[]>(this.apiUrl, { params: filters }).pipe(
      tap(rates => this.taxRatesSignal.set(rates))
    );
  }

  findOne(id: string): Observable<TaxRate> {
    return this.http.get<TaxRate>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateTaxRateDto): Observable<TaxRate> {
    return this.http.post<TaxRate>(this.apiUrl, dto).pipe(
      tap(rate => {
        this.taxRatesSignal.update(rates => [...rates, rate]);
      })
    );
  }

  update(id: string, dto: UpdateTaxRateDto): Observable<TaxRate> {
    return this.http.patch<TaxRate>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updated => {
        this.taxRatesSignal.update(rates =>
          rates.map(r => r._id === id ? updated : r)
        );
      })
    );
  }

  activate(id: string): Observable<TaxRate> {
    return this.http.patch<TaxRate>(`${this.apiUrl}/${id}/activate`, {}).pipe(
      tap(updated => {
        this.taxRatesSignal.update(rates =>
          rates.map(r => r._id === id ? updated : r)
        );
      })
    );
  }

  deactivate(id: string): Observable<TaxRate> {
    return this.http.patch<TaxRate>(`${this.apiUrl}/${id}/deactivate`, {}).pipe(
      tap(updated => {
        this.taxRatesSignal.update(rates =>
          rates.map(r => r._id === id ? updated : r)
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.taxRatesSignal.update(rates => rates.filter(r => r._id !== id));
      })
    );
  }

  getStatistics(): Observable<TaxStatistics> {
    return this.http.get<TaxStatistics>(`${this.apiUrl}/statistics`);
  }
}
