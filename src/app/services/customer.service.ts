import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Customer } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/customers`;

  private customersSignal = signal<Customer[]>([]);
  public readonly customers = this.customersSignal.asReadonly();

  findAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl).pipe(
      tap(customers => this.customersSignal.set(customers))
    );
  }

  findOne(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  search(query: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }

  create(customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpent' | 'visitCount'>): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer).pipe(
      tap(() => this.findAll().subscribe())
    );
  }

  update(id: string, customer: Partial<Customer>): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/${id}`, customer).pipe(
      tap(() => this.findAll().subscribe())
    );
  }

  recordPurchase(id: string, amount: number): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/${id}/purchase`, { amount }).pipe(
      tap(() => this.findAll().subscribe())
    );
  }

  redeemPoints(id: string, points: number): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/${id}/redeem`, { points }).pipe(
      tap(() => this.findAll().subscribe())
    );
  }
}
