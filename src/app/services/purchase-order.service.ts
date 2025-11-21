import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PurchaseOrderItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  locationId: string;
  supplierId: string;
  status: 'draft' | 'submitted' | 'approved' | 'sent' | 'partially_received' | 'received' | 'cancelled';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/purchase-orders`;

  private purchaseOrdersSignal = signal<PurchaseOrder[]>([]);
  readonly purchaseOrders = this.purchaseOrdersSignal.asReadonly();

  async loadPurchaseOrders() {
    const orders = await firstValueFrom(this.http.get<PurchaseOrder[]>(this.apiUrl));
    this.purchaseOrdersSignal.set(orders);
    return orders;
  }

  async getPurchaseOrder(id: string) {
    return firstValueFrom(this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`));
  }

  async createPurchaseOrder(order: Partial<PurchaseOrder>) {
    const newOrder = await firstValueFrom(
      this.http.post<PurchaseOrder>(this.apiUrl, order)
    );
    this.purchaseOrdersSignal.update((orders) => [...orders, newOrder]);
    return newOrder;
  }

  async updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>) {
    const updated = await firstValueFrom(
      this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}`, updates)
    );
    this.purchaseOrdersSignal.update((orders) =>
      orders.map((o) => (o._id === id ? updated : o))
    );
    return updated;
  }

  async submitOrder(id: string) {
    return firstValueFrom(
      this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}/submit`, {})
    );
  }

  async approveOrder(id: string) {
    return firstValueFrom(
      this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}/approve`, {})
    );
  }

  async receiveOrder(id: string, receivedItems: any[]) {
    return firstValueFrom(
      this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/receive`, {
        receivedItems,
      })
    );
  }

  async cancelOrder(id: string, reason: string) {
    return firstValueFrom(
      this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}/cancel`, { reason })
    );
  }
}
