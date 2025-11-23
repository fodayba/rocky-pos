import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Invoice, CreateInvoiceDto, UpdateInvoiceDto, InvoiceStatistics, RecordPaymentDto } from '../models/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/invoices`;

  private invoicesSignal = signal<Invoice[]>([]);
  readonly invoices = this.invoicesSignal.asReadonly();

  findAll(filters?: any): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl, { params: filters }).pipe(
      tap(invoices => this.invoicesSignal.set(invoices))
    );
  }

  findOne(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateInvoiceDto): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, dto).pipe(
      tap(invoice => {
        this.invoicesSignal.update(invoices => [...invoices, invoice]);
      })
    );
  }

  update(id: string, dto: UpdateInvoiceDto): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updated => {
        this.invoicesSignal.update(invoices =>
          invoices.map(i => i._id === id ? updated : i)
        );
      })
    );
  }

  send(id: string): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/${id}/send`, {}).pipe(
      tap(updated => {
        this.invoicesSignal.update(invoices =>
          invoices.map(i => i._id === id ? updated : i)
        );
      })
    );
  }

  recordPayment(id: string, dto: RecordPaymentDto): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${id}/payment`, dto).pipe(
      tap(updated => {
        this.invoicesSignal.update(invoices =>
          invoices.map(i => i._id === id ? updated : i)
        );
      })
    );
  }

  cancel(id: string): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/${id}/cancel`, {}).pipe(
      tap(updated => {
        this.invoicesSignal.update(invoices =>
          invoices.map(i => i._id === id ? updated : i)
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.invoicesSignal.update(invoices => invoices.filter(i => i._id !== id));
      })
    );
  }

  getStatistics(): Observable<InvoiceStatistics> {
    return this.http.get<InvoiceStatistics>(`${this.apiUrl}/statistics`);
  }

  getOverdue(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/overdue`);
  }
}
