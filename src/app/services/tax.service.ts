import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TaxRate {
  categoryName: string;
  rate: number;
  effectiveDate: Date;
  endDate?: Date;
}

export interface TaxJurisdiction {
  _id: string;
  jurisdictionCode: string;
  name: string;
  state: string;
  county?: string;
  city?: string;
  zipCode?: string;
  taxType: 'sales_tax' | 'fuel_tax' | 'combined';
  rates: TaxRate[];
  status: 'active' | 'inactive';
  filingFrequency: 'monthly' | 'quarterly' | 'annually';
  taxIdNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxCalculation {
  items: Array<{
    name: string;
    amount: number;
    category: string;
  }>;
  subtotal: number;
  taxAmount: number;
  total: number;
  appliedRates: TaxRate[];
}

@Injectable({
  providedIn: 'root',
})
export class TaxService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tax/jurisdictions`;

  private jurisdictionsSignal = signal<TaxJurisdiction[]>([]);
  readonly jurisdictions = this.jurisdictionsSignal.asReadonly();

  async loadJurisdictions() {
    const jurisdictions = await firstValueFrom(
      this.http.get<TaxJurisdiction[]>(this.apiUrl)
    );
    this.jurisdictionsSignal.set(jurisdictions);
    return jurisdictions;
  }

  async getJurisdiction(id: string) {
    return firstValueFrom(this.http.get<TaxJurisdiction>(`${this.apiUrl}/${id}`));
  }

  async createJurisdiction(jurisdiction: Partial<TaxJurisdiction>) {
    const newJurisdiction = await firstValueFrom(
      this.http.post<TaxJurisdiction>(this.apiUrl, jurisdiction)
    );
    this.jurisdictionsSignal.update((jurisdictions) => [
      ...jurisdictions,
      newJurisdiction,
    ]);
    return newJurisdiction;
  }

  async updateJurisdiction(id: string, updates: Partial<TaxJurisdiction>) {
    const updated = await firstValueFrom(
      this.http.patch<TaxJurisdiction>(`${this.apiUrl}/${id}`, updates)
    );
    this.jurisdictionsSignal.update((jurisdictions) =>
      jurisdictions.map((j) => (j._id === id ? updated : j))
    );
    return updated;
  }

  async addTaxRate(id: string, rate: TaxRate) {
    return firstValueFrom(
      this.http.post<TaxJurisdiction>(`${this.apiUrl}/${id}/rates`, rate)
    );
  }

  async calculateTax(items: any[], zipCode?: string) {
    return firstValueFrom(
      this.http.post<TaxCalculation>(`${environment.apiUrl}/tax/calculate`, {
        items,
        zipCode,
      })
    );
  }

  async getFilingReport(id: string, startDate: Date, endDate: Date) {
    return firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/${id}/filing-report`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      })
    );
  }
}
