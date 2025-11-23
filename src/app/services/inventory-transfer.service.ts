import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { InventoryTransfer, CreateTransferDto, TransferStatistics } from '../models/inventory-transfer.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryTransferService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventory-transfers`;

  private transfersSignal = signal<InventoryTransfer[]>([]);
  readonly transfers = this.transfersSignal.asReadonly();

  findAll(filters?: any): Observable<InventoryTransfer[]> {
    return this.http.get<InventoryTransfer[]>(this.apiUrl, { params: filters }).pipe(
      tap(transfers => this.transfersSignal.set(transfers))
    );
  }

  findOne(id: string): Observable<InventoryTransfer> {
    return this.http.get<InventoryTransfer>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateTransferDto): Observable<InventoryTransfer> {
    return this.http.post<InventoryTransfer>(this.apiUrl, dto).pipe(
      tap(transfer => {
        this.transfersSignal.update(transfers => [...transfers, transfer]);
      })
    );
  }

  approve(id: string): Observable<InventoryTransfer> {
    return this.http.patch<InventoryTransfer>(`${this.apiUrl}/${id}/approve`, {}).pipe(
      tap(updated => {
        this.transfersSignal.update(transfers =>
          transfers.map(t => t._id === id ? updated : t)
        );
      })
    );
  }

  ship(id: string): Observable<InventoryTransfer> {
    return this.http.patch<InventoryTransfer>(`${this.apiUrl}/${id}/ship`, {}).pipe(
      tap(updated => {
        this.transfersSignal.update(transfers =>
          transfers.map(t => t._id === id ? updated : t)
        );
      })
    );
  }

  receive(id: string, items: any[]): Observable<InventoryTransfer> {
    return this.http.patch<InventoryTransfer>(`${this.apiUrl}/${id}/receive`, { items }).pipe(
      tap(updated => {
        this.transfersSignal.update(transfers =>
          transfers.map(t => t._id === id ? updated : t)
        );
      })
    );
  }

  cancel(id: string): Observable<InventoryTransfer> {
    return this.http.patch<InventoryTransfer>(`${this.apiUrl}/${id}/cancel`, {}).pipe(
      tap(updated => {
        this.transfersSignal.update(transfers =>
          transfers.map(t => t._id === id ? updated : t)
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.transfersSignal.update(transfers => transfers.filter(t => t._id !== id));
      })
    );
  }

  getStatistics(): Observable<TransferStatistics> {
    return this.http.get<TransferStatistics>(`${this.apiUrl}/statistics`);
  }
}
