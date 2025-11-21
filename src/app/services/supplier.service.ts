import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Supplier {
  _id: string;
  supplierCode: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  supplierType: string[];
  paymentTerms: 'NET_15' | 'NET_30' | 'NET_60' | 'NET_90' | 'COD' | 'PREPAID';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  isPreferred: boolean;
  performanceMetrics?: {
    onTimeDeliveryRate: number;
    qualityRating: number;
    averageLeadTimeDays: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/suppliers`;

  private suppliersSignal = signal<Supplier[]>([]);
  readonly suppliers = this.suppliersSignal.asReadonly();

  async loadSuppliers() {
    const suppliers = await firstValueFrom(this.http.get<Supplier[]>(this.apiUrl));
    this.suppliersSignal.set(suppliers);
    return suppliers;
  }

  async getSupplier(id: string) {
    return firstValueFrom(this.http.get<Supplier>(`${this.apiUrl}/${id}`));
  }

  async createSupplier(supplier: Partial<Supplier>) {
    const newSupplier = await firstValueFrom(
      this.http.post<Supplier>(this.apiUrl, supplier)
    );
    this.suppliersSignal.update((suppliers) => [...suppliers, newSupplier]);
    return newSupplier;
  }

  async updateSupplier(id: string, updates: Partial<Supplier>) {
    const updated = await firstValueFrom(
      this.http.patch<Supplier>(`${this.apiUrl}/${id}`, updates)
    );
    this.suppliersSignal.update((suppliers) =>
      suppliers.map((s) => (s._id === id ? updated : s))
    );
    return updated;
  }

  async deleteSupplier(id: string) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
    this.suppliersSignal.update((suppliers) =>
      suppliers.filter((s) => s._id !== id)
    );
  }

  async getActiveSuppliers() {
    return firstValueFrom(this.http.get<Supplier[]>(`${this.apiUrl}/active`));
  }

  async searchSuppliers(query: string) {
    return firstValueFrom(
      this.http.get<Supplier[]>(`${this.apiUrl}/search`, { params: { q: query } })
    );
  }
}
