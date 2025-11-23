import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  FleetAccount,
  CreateFleetAccountDto,
  UpdateFleetAccountDto,
  IssueFleetCardDto,
  FleetAccountStatistics
} from '../models/fleet-account.model';

@Injectable({
  providedIn: 'root',
})
export class FleetAccountService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/fleet-accounts`;

  private accountsSignal = signal<FleetAccount[]>([]);
  readonly accounts = this.accountsSignal.asReadonly();

  findAll(filters?: any): Observable<FleetAccount[]> {
    return this.http.get<FleetAccount[]>(this.apiUrl, { params: filters }).pipe(
      tap(accounts => this.accountsSignal.set(accounts))
    );
  }

  findOne(id: string): Observable<FleetAccount> {
    return this.http.get<FleetAccount>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateFleetAccountDto): Observable<FleetAccount> {
    return this.http.post<FleetAccount>(this.apiUrl, dto).pipe(
      tap(account => {
        this.accountsSignal.update(accounts => [...accounts, account]);
      })
    );
  }

  update(id: string, dto: UpdateFleetAccountDto): Observable<FleetAccount> {
    return this.http.patch<FleetAccount>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updated => {
        this.accountsSignal.update(accounts =>
          accounts.map(a => a._id === id ? updated : a)
        );
      })
    );
  }

  activate(id: string): Observable<FleetAccount> {
    return this.http.patch<FleetAccount>(`${this.apiUrl}/${id}/activate`, {}).pipe(
      tap(updated => {
        this.accountsSignal.update(accounts =>
          accounts.map(a => a._id === id ? updated : a)
        );
      })
    );
  }

  suspend(id: string, reason: string): Observable<FleetAccount> {
    return this.http.patch<FleetAccount>(`${this.apiUrl}/${id}/suspend`, { reason }).pipe(
      tap(updated => {
        this.accountsSignal.update(accounts =>
          accounts.map(a => a._id === id ? updated : a)
        );
      })
    );
  }

  issueCard(id: string, dto: IssueFleetCardDto): Observable<FleetAccount> {
    return this.http.post<FleetAccount>(`${this.apiUrl}/${id}/cards`, dto).pipe(
      tap(updated => {
        this.accountsSignal.update(accounts =>
          accounts.map(a => a._id === id ? updated : a)
        );
      })
    );
  }

  suspendCard(id: string, cardId: string, reason: string): Observable<FleetAccount> {
    return this.http.patch<FleetAccount>(`${this.apiUrl}/${id}/cards/${cardId}/suspend`, { reason }).pipe(
      tap(updated => {
        this.accountsSignal.update(accounts =>
          accounts.map(a => a._id === id ? updated : a)
        );
      })
    );
  }

  recordPayment(id: string, amount: number, method: string): Observable<FleetAccount> {
    return this.http.post<FleetAccount>(`${this.apiUrl}/${id}/payment`, { amount, method }).pipe(
      tap(updated => {
        this.accountsSignal.update(accounts =>
          accounts.map(a => a._id === id ? updated : a)
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.accountsSignal.update(accounts => accounts.filter(a => a._id !== id));
      })
    );
  }

  getStatistics(): Observable<FleetAccountStatistics> {
    return this.http.get<FleetAccountStatistics>(`${this.apiUrl}/statistics`);
  }
}
