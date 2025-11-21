import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InvoicePayment {
  paymentDate: Date;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  fleetAccountId: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  subtotal: number;
  tax: number;
  lateFees: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  payments: InvoicePayment[];
  sentDate?: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/invoices`;

  private invoicesSignal = signal<Invoice[]>([]);
  readonly invoices = this.invoicesSignal.asReadonly();

  async loadInvoices() {
    const invoices = await firstValueFrom(this.http.get<Invoice[]>(this.apiUrl));
    this.invoicesSignal.set(invoices);
    return invoices;
  }

  async getInvoice(id: string) {
    return firstValueFrom(this.http.get<Invoice>(`${this.apiUrl}/${id}`));
  }

  async createInvoice(invoice: Partial<Invoice>) {
    const newInvoice = await firstValueFrom(
      this.http.post<Invoice>(this.apiUrl, invoice)
    );
    this.invoicesSignal.update((invoices) => [...invoices, newInvoice]);
    return newInvoice;
  }

  async generateInvoice(fleetAccountId: string, startDate: Date, endDate: Date) {
    const invoice = await firstValueFrom(
      this.http.post<Invoice>(`${this.apiUrl}/generate`, {
        fleetAccountId,
        startDate,
        endDate,
      })
    );
    this.invoicesSignal.update((invoices) => [...invoices, invoice]);
    return invoice;
  }

  async sendInvoice(id: string) {
    return firstValueFrom(
      this.http.post<Invoice>(`${this.apiUrl}/${id}/send`, {})
    );
  }

  async recordPayment(id: string, payment: Partial<InvoicePayment>) {
    return firstValueFrom(
      this.http.post<Invoice>(`${this.apiUrl}/${id}/payment`, payment)
    );
  }

  async applyLateFee(id: string, amount: number, reason: string) {
    return firstValueFrom(
      this.http.post<Invoice>(`${this.apiUrl}/${id}/late-fee`, { amount, reason })
    );
  }

  async getOverdueInvoices() {
    return firstValueFrom(this.http.get<Invoice[]>(`${this.apiUrl}/overdue`));
  }
}
