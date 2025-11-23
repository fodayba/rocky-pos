import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierStatistics,
  SupplierType
} from '../models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/suppliers`;

  private suppliersSignal = signal<Supplier[]>([]);
  readonly suppliers = this.suppliersSignal.asReadonly();

  findAll(filters?: any): Observable<Supplier[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Supplier[]>(this.apiUrl, { params }).pipe(
      tap(suppliers => this.suppliersSignal.set(suppliers))
    );
  }

  findOne(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  findActive(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/active`);
  }

  findPreferred(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/preferred`);
  }

  search(searchTerm: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/search`, {
      params: { q: searchTerm }
    });
  }

  findByType(type: SupplierType): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/type/${type}`);
  }

  findByCode(supplierCode: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/code/${supplierCode}`);
  }

  create(dto: CreateSupplierDto): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, dto).pipe(
      tap(supplier => {
        this.suppliersSignal.update(suppliers => [...suppliers, supplier]);
      })
    );
  }

  update(id: string, dto: UpdateSupplierDto): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updated => {
        this.suppliersSignal.update(suppliers =>
          suppliers.map(s => s._id === id ? updated : s)
        );
      })
    );
  }

  updateBalance(id: string, amount: number): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.apiUrl}/${id}/balance`, { amount }).pipe(
      tap(updated => {
        this.suppliersSignal.update(suppliers =>
          suppliers.map(s => s._id === id ? updated : s)
        );
      })
    );
  }

  updatePerformance(id: string, onTimeRate: number, qualityRating: number): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.apiUrl}/${id}/performance`, {
      onTimeRate,
      qualityRating
    }).pipe(
      tap(updated => {
        this.suppliersSignal.update(suppliers =>
          suppliers.map(s => s._id === id ? updated : s)
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.suppliersSignal.update(suppliers =>
          suppliers.filter(s => s._id !== id)
        );
      })
    );
  }

  getStatistics(): Observable<SupplierStatistics> {
    return this.http.get<SupplierStatistics>(`${this.apiUrl}/statistics`);
  }
}
