import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export interface InventoryTransfer {
  _id: string;
  transferNumber: string;
  fromLocationId: string;
  toLocationId: string;
  status: 'pending' | 'approved' | 'in_transit' | 'received' | 'rejected';
  items: TransferItem[];
  totalValue: number;
  requestedBy: string;
  requestedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  shippedDate?: Date;
  receivedDate?: Date;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class InventoryTransferService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventory-transfers`;

  private transfersSignal = signal<InventoryTransfer[]>([]);
  readonly transfers = this.transfersSignal.asReadonly();

  async loadTransfers() {
    const transfers = await firstValueFrom(
      this.http.get<InventoryTransfer[]>(this.apiUrl)
    );
    this.transfersSignal.set(transfers);
    return transfers;
  }

  async getTransfer(id: string) {
    return firstValueFrom(this.http.get<InventoryTransfer>(`${this.apiUrl}/${id}`));
  }

  async createTransfer(transfer: Partial<InventoryTransfer>) {
    const newTransfer = await firstValueFrom(
      this.http.post<InventoryTransfer>(this.apiUrl, transfer)
    );
    this.transfersSignal.update((transfers) => [...transfers, newTransfer]);
    return newTransfer;
  }

  async approveTransfer(id: string) {
    const updated = await firstValueFrom(
      this.http.patch<InventoryTransfer>(`${this.apiUrl}/${id}/approve`, {})
    );
    this.transfersSignal.update((transfers) =>
      transfers.map((t) => (t._id === id ? updated : t))
    );
    return updated;
  }

  async shipTransfer(id: string) {
    const updated = await firstValueFrom(
      this.http.patch<InventoryTransfer>(`${this.apiUrl}/${id}/ship`, {})
    );
    this.transfersSignal.update((transfers) =>
      transfers.map((t) => (t._id === id ? updated : t))
    );
    return updated;
  }

  async receiveTransfer(id: string, receivedItems: any[]) {
    const updated = await firstValueFrom(
      this.http.patch<InventoryTransfer>(`${this.apiUrl}/${id}/receive`, {
        receivedItems,
      })
    );
    this.transfersSignal.update((transfers) =>
      transfers.map((t) => (t._id === id ? updated : t))
    );
    return updated;
  }

  async rejectTransfer(id: string, reason: string) {
    const updated = await firstValueFrom(
      this.http.patch<InventoryTransfer>(`${this.apiUrl}/${id}/reject`, { reason })
    );
    this.transfersSignal.update((transfers) =>
      transfers.map((t) => (t._id === id ? updated : t))
    );
    return updated;
  }
}
