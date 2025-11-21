import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Transaction } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/transactions`;

  private transactionsSignal = signal<Transaction[]>([]);
  public readonly transactions = this.transactionsSignal.asReadonly();

  getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.transactionsSignal().filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate >= startDate && transactionDate < endDate;
    });
  }

  createTransaction(transaction: Omit<Transaction, 'id' | 'transactionNumber' | 'createdAt'>): Observable<Transaction> {
    return this.create(transaction);
  }

  findAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl).pipe(
      tap(transactions => this.transactionsSignal.set(transactions))
    );
  }

  findOne(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  findByShift(shiftId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/shift/${shiftId}`);
  }

  findByDateRange(startDate: string, endDate: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/date-range`, {
      params: { startDate, endDate }
    });
  }

  create(transaction: Omit<Transaction, 'id' | 'transactionNumber' | 'createdAt'>): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction).pipe(
      tap(() => this.findAll().subscribe())
    );
  }
}
