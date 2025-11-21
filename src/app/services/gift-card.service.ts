import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GiftCardTransaction {
  timestamp: Date;
  type: 'issue' | 'reload' | 'purchase' | 'refund' | 'void';
  amount: number;
  balanceAfter: number;
  locationId?: string;
  transactionId?: string;
  userId?: string;
  notes?: string;
}

export interface GiftCard {
  _id: string;
  cardNumber: string;
  lastFourDigits: string;
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  balance: number;
  initialValue: number;
  totalLoaded: number;
  totalSpent: number;
  issuedLocationId: string;
  issueDate: Date;
  expiryDate?: Date;
  neverExpires: boolean;
  transactions: GiftCardTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class GiftCardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/gift-cards`;

  private giftCardsSignal = signal<GiftCard[]>([]);
  readonly giftCards = this.giftCardsSignal.asReadonly();

  async loadGiftCards() {
    const cards = await firstValueFrom(this.http.get<GiftCard[]>(this.apiUrl));
    this.giftCardsSignal.set(cards);
    return cards;
  }

  async getGiftCard(id: string) {
    return firstValueFrom(this.http.get<GiftCard>(`${this.apiUrl}/${id}`));
  }

  async getGiftCardByNumber(cardNumber: string) {
    return firstValueFrom(
      this.http.get<GiftCard>(`${this.apiUrl}/card/${cardNumber}`)
    );
  }

  async checkBalance(cardNumber: string) {
    return firstValueFrom(
      this.http.get<{ balance: number }>(`${this.apiUrl}/card/${cardNumber}/balance`)
    );
  }

  async createGiftCard(card: Partial<GiftCard>) {
    const newCard = await firstValueFrom(
      this.http.post<GiftCard>(this.apiUrl, card)
    );
    this.giftCardsSignal.update((cards) => [...cards, newCard]);
    return newCard;
  }

  async reloadGiftCard(cardNumber: string, amount: number) {
    return firstValueFrom(
      this.http.post<GiftCard>(`${this.apiUrl}/card/${cardNumber}/reload`, {
        amount,
      })
    );
  }

  async deactivateGiftCard(cardNumber: string, reason: string) {
    return firstValueFrom(
      this.http.patch<GiftCard>(`${this.apiUrl}/card/${cardNumber}/deactivate`, {
        reason,
      })
    );
  }

  async reportLost(cardNumber: string) {
    return firstValueFrom(
      this.http.patch<GiftCard>(`${this.apiUrl}/card/${cardNumber}/report-lost`, {})
    );
  }
}
