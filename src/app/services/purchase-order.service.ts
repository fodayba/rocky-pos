import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  ReceivePurchaseOrderDto,
  PurchaseOrderStatistics
} from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/purchase-orders`;

  private purchaseOrdersSignal = signal<PurchaseOrder[]>([]);
  readonly purchaseOrders = this.purchaseOrdersSignal.asReadonly();

  findAll(filters?: any): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(this.apiUrl, { params: filters }).pipe(
      tap(orders => this.purchaseOrdersSignal.set(orders))
    );
  }

  findOne(id: string): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreatePurchaseOrderDto): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.apiUrl, dto).pipe(
      tap(order => {
        this.purchaseOrdersSignal.update(orders => [...orders, order]);
      })
    );
  }

  update(id: string, dto: UpdatePurchaseOrderDto): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updated => {
        this.purchaseOrdersSignal.update(orders =>
          orders.map(o => o._id === id ? updated : o)
        );
      })
    );
  }

  approve(id: string): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}/approve`, {}).pipe(
      tap(updated => {
        this.purchaseOrdersSignal.update(orders =>
          orders.map(o => o._id === id ? updated : o)
        );
      })
    );
  }

  send(id: string): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/send`, {}).pipe(
      tap(updated => {
        this.purchaseOrdersSignal.update(orders =>
          orders.map(o => o._id === id ? updated : o)
        );
      })
    );
  }

  receive(id: string, dto: ReceivePurchaseOrderDto): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/receive`, dto).pipe(
      tap(updated => {
        this.purchaseOrdersSignal.update(orders =>
          orders.map(o => o._id === id ? updated : o)
        );
      })
    );
  }

  cancel(id: string, reason: string): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}/cancel`, { reason }).pipe(
      tap(updated => {
        this.purchaseOrdersSignal.update(orders =>
          orders.map(o => o._id === id ? updated : o)
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.purchaseOrdersSignal.update(orders => orders.filter(o => o._id !== id));
      })
    );
  }

  getStatistics(): Observable<PurchaseOrderStatistics> {
    return this.http.get<PurchaseOrderStatistics>(`${this.apiUrl}/statistics`);
  }
}
