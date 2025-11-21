import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Promotion {
  _id: string;
  name: string;
  description: string;
  type: 'percentage_discount' | 'fixed_discount' | 'buy_x_get_y' | 'bundle' | 'loyalty_multiplier' | 'free_item';
  status: 'active' | 'paused' | 'scheduled' | 'expired';
  discountPercent?: number;
  discountAmount?: number;
  startDate: Date;
  endDate?: Date;
  applicableProducts: string[];
  applicableCategories: string[];
  couponCode?: string;
  requiresCoupon: boolean;
  usageLimit?: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/promotions`;

  private promotionsSignal = signal<Promotion[]>([]);
  readonly promotions = this.promotionsSignal.asReadonly();

  async loadPromotions() {
    const promotions = await firstValueFrom(this.http.get<Promotion[]>(this.apiUrl));
    this.promotionsSignal.set(promotions);
    return promotions;
  }

  async getPromotion(id: string) {
    return firstValueFrom(this.http.get<Promotion>(`${this.apiUrl}/${id}`));
  }

  async createPromotion(promotion: Partial<Promotion>) {
    const newPromotion = await firstValueFrom(
      this.http.post<Promotion>(this.apiUrl, promotion)
    );
    this.promotionsSignal.update((promotions) => [...promotions, newPromotion]);
    return newPromotion;
  }

  async updatePromotion(id: string, updates: Partial<Promotion>) {
    const updated = await firstValueFrom(
      this.http.patch<Promotion>(`${this.apiUrl}/${id}`, updates)
    );
    this.promotionsSignal.update((promotions) =>
      promotions.map((p) => (p._id === id ? updated : p))
    );
    return updated;
  }

  async activatePromotion(id: string) {
    return firstValueFrom(
      this.http.patch<Promotion>(`${this.apiUrl}/${id}/activate`, {})
    );
  }

  async pausePromotion(id: string) {
    return firstValueFrom(
      this.http.patch<Promotion>(`${this.apiUrl}/${id}/pause`, {})
    );
  }

  async deletePromotion(id: string) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
    this.promotionsSignal.update((promotions) =>
      promotions.filter((p) => p._id !== id)
    );
  }

  async getActivePromotions() {
    return firstValueFrom(this.http.get<Promotion[]>(`${this.apiUrl}/active`));
  }
}
