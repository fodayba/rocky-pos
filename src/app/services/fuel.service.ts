import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { FuelProduct } from '../models';
import { environment } from '../../environments/environment';

export type { FuelProduct } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FuelService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/fuel`;

  private fuelProductsSignal = signal<FuelProduct[]>([]);
  public readonly fuelProducts = this.fuelProductsSignal.asReadonly();

  public readonly getLowFuelProducts = computed(() => {
    return this.fuelProductsSignal().filter(f => f.currentStock <= f.minLevel);
  });

  getFuelProductById(id: string): FuelProduct | undefined {
    return this.fuelProductsSignal().find(f => f.id === id);
  }

  findAll(): Observable<FuelProduct[]> {
    return this.http.get<FuelProduct[]>(this.apiUrl).pipe(
      tap(products => this.fuelProductsSignal.set(products))
    );
  }

  loadFuelProducts(): Observable<FuelProduct[]> {
    return this.findAll();
  }

  findOne(id: string): Observable<FuelProduct> {
    return this.http.get<FuelProduct>(`${this.apiUrl}/${id}`);
  }

  findLowLevel(): Observable<FuelProduct[]> {
    return this.http.get<FuelProduct[]>(`${this.apiUrl}/low-level`);
  }

  getLowLevelProducts(): Observable<FuelProduct[]> {
    return this.findLowLevel();
  }

  updatePrice(id: string, pricePerGallon: number, cashPricePerGallon?: number): Observable<FuelProduct> {
    return this.http.patch<FuelProduct>(`${this.apiUrl}/${id}/price`, {
      pricePerGallon,
      cashPricePerGallon
    }).pipe(
      tap(() => this.findAll().subscribe())
    );
  }

  recordDelivery(id: string, delivery: {
    amount: number;
    cost?: number;
    notes?: string;
  }): Observable<FuelProduct> {
    return this.http.post<FuelProduct>(`${this.apiUrl}/${id}/delivery`, delivery).pipe(
      tap(() => this.findAll().subscribe())
    );
  }
}
