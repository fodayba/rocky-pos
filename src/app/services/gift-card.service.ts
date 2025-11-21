import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  GiftCard,
  IssueGiftCardDto,
  RedeemGiftCardDto,
  ReloadGiftCardDto,
  GiftCardStatistics
} from '../models/gift-card.model';

@Injectable({
  providedIn: 'root',
})
export class GiftCardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/gift-cards`;

  private giftCardsSignal = signal<GiftCard[]>([]);
  readonly giftCards = this.giftCardsSignal.asReadonly();

  findAll(filters?: any): Observable<GiftCard[]> {
    return this.http.get<GiftCard[]>(this.apiUrl, { params: filters }).pipe(
      tap(cards => this.giftCardsSignal.set(cards))
    );
  }

  findOne(id: string): Observable<GiftCard> {
    return this.http.get<GiftCard>(`${this.apiUrl}/${id}`);
  }

  findByCardNumber(cardNumber: string): Observable<GiftCard> {
    return this.http.get<GiftCard>(`${this.apiUrl}/card-number/${cardNumber}`);
  }

  checkBalance(cardNumber: string, pin: string): Observable<{ balance: number }> {
    return this.http.post<{ balance: number }>(`${this.apiUrl}/check-balance`, {
      cardNumber,
      pin
    });
  }

  issue(dto: IssueGiftCardDto): Observable<GiftCard> {
    return this.http.post<GiftCard>(this.apiUrl, dto).pipe(
      tap(card => {
        this.giftCardsSignal.update(cards => [...cards, card]);
      })
    );
  }

  redeem(id: string, dto: RedeemGiftCardDto): Observable<GiftCard> {
    return this.http.post<GiftCard>(`${this.apiUrl}/${id}/redeem`, dto).pipe(
      tap(updated => {
        this.giftCardsSignal.update(cards =>
          cards.map(c => c._id === id ? updated : c)
        );
      })
    );
  }

  reload(id: string, dto: ReloadGiftCardDto): Observable<GiftCard> {
    return this.http.post<GiftCard>(`${this.apiUrl}/${id}/reload`, dto).pipe(
      tap(updated => {
        this.giftCardsSignal.update(cards =>
          cards.map(c => c._id === id ? updated : c)
        );
      })
    );
  }

  activate(id: string): Observable<GiftCard> {
    return this.http.patch<GiftCard>(`${this.apiUrl}/${id}/activate`, {}).pipe(
      tap(updated => {
        this.giftCardsSignal.update(cards =>
          cards.map(c => c._id === id ? updated : c)
        );
      })
    );
  }

  suspend(id: string, reason: string): Observable<GiftCard> {
    return this.http.patch<GiftCard>(`${this.apiUrl}/${id}/suspend`, { reason }).pipe(
      tap(updated => {
        this.giftCardsSignal.update(cards =>
          cards.map(c => c._id === id ? updated : c)
        );
      })
    );
  }

  transfer(id: string, newCustomerId: string): Observable<GiftCard> {
    return this.http.patch<GiftCard>(`${this.apiUrl}/${id}/transfer`, {
      newCustomerId
    }).pipe(
      tap(updated => {
        this.giftCardsSignal.update(cards =>
          cards.map(c => c._id === id ? updated : c)
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.giftCardsSignal.update(cards => cards.filter(c => c._id !== id));
      })
    );
  }

  getStatistics(): Observable<GiftCardStatistics> {
    return this.http.get<GiftCardStatistics>(`${this.apiUrl}/statistics`);
  }
}
