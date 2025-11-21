import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { FuelProduct } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FuelService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/fuel`;

  private fuelProductsSignal = signal<FuelProduct[]>([]);
  public readonly fuelProducts = this.fuelProductsSignal.asReadonly();

  findAll(): Observable<FuelProduct[]> {
    return this.http.get<FuelProduct[]>(this.apiUrl).pipe(
      tap(products => this.fuelProductsSignal.set(products))
    );
  }

  findOne(id: string): Observable<FuelProduct> {
    return this.http.get<FuelProduct>(`${this.apiUrl}/${id}`);
  }

  findLowLevel(): Observable<FuelProduct[]> {
    return this.http.get<FuelProduct[]>(`${this.apiUrl}/low-level`);
  }

  updatePrice(id: string, price: number): Observable<FuelProduct> {
    return this.http.patch<FuelProduct>(`${this.apiUrl}/${id}/price`, { price }).pipe(
      tap(() => this.findAll().subscribe())
    );
  }

  recordDelivery(id: string, amount: number): Observable<FuelProduct> {
    return this.http.post<FuelProduct>(`${this.apiUrl}/${id}/delivery`, { amount }).pipe(
      tap(() => this.findAll().subscribe())
    );
  }
}
