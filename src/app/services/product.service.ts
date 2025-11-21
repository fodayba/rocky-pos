import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Product } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  private productsSignal = signal<Product[]>([]);
  public readonly products = this.productsSignal.asReadonly();

  findAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(products => this.productsSignal.set(products))
    );
  }

  findOne(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  findByBarcode(barcode: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/barcode/${barcode}`);
  }

  findLowStock(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`);
  }

  create(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(() => this.findAll().subscribe())
    );
  }

  update(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, product).pipe(
      tap(() => this.findAll().subscribe())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.findAll().subscribe())
    );
  }
}
