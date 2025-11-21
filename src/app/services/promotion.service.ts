import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Promotion,
  CreatePromotionDto,
  UpdatePromotionDto,
  PromotionStatus
} from '../models/promotion.model';

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/promotions`;

  private promotionsSignal = signal<Promotion[]>([]);
  readonly promotions = this.promotionsSignal.asReadonly();

  findAll(filters?: any): Observable<Promotion[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Promotion[]>(this.apiUrl, { params }).pipe(
      tap(promotions => this.promotionsSignal.set(promotions))
    );
  }

  findOne(id: string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`);
  }

  findActive(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/active`);
  }

  findByStatus(status: PromotionStatus): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/status/${status}`);
  }

  create(dto: CreatePromotionDto): Observable<Promotion> {
    return this.http.post<Promotion>(this.apiUrl, dto).pipe(
      tap(promotion => {
        this.promotionsSignal.update(promotions => [...promotions, promotion]);
      })
    );
  }

  update(id: string, dto: UpdatePromotionDto): Observable<Promotion> {
    return this.http.patch<Promotion>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updated => {
        this.promotionsSignal.update(promotions =>
          promotions.map(p => p._id === id ? updated : p)
        );
      })
    );
  }

  activate(id: string): Observable<Promotion> {
    return this.http.patch<Promotion>(`${this.apiUrl}/${id}/activate`, {}).pipe(
      tap(updated => {
        this.promotionsSignal.update(promotions =>
          promotions.map(p => p._id === id ? updated : p)
        );
      })
    );
  }

  pause(id: string): Observable<Promotion> {
    return this.http.patch<Promotion>(`${this.apiUrl}/${id}/pause`, {}).pipe(
      tap(updated => {
        this.promotionsSignal.update(promotions =>
          promotions.map(p => p._id === id ? updated : p)
        );
      })
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.promotionsSignal.update(promotions =>
          promotions.filter(p => p._id !== id)
        );
      })
    );
  }
}
