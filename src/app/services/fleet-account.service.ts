import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FleetVehicle {
  vehicleNumber: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  active: boolean;
}

export interface FleetDriver {
  name: string;
  driverNumber: string;
  licenseNumber?: string;
  phone?: string;
  active: boolean;
  pinNumber?: string;
}

export interface FleetCard {
  cardNumber: string;
  lastFourDigits: string;
  assignedTo?: string;
  issueDate: Date;
  expiryDate?: Date;
  active: boolean;
}

export interface FleetAccount {
  _id: string;
  accountNumber: string;
  companyName: string;
  status: 'active' | 'suspended' | 'closed' | 'pending_approval';
  contactName: string;
  email: string;
  phone: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  paymentTerms: 'net_15' | 'net_30' | 'net_60' | 'prepaid';
  creditLimit: number;
  currentBalance: number;
  vehicles: FleetVehicle[];
  drivers: FleetDriver[];
  cards: FleetCard[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class FleetAccountService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/fleet-accounts`;

  private accountsSignal = signal<FleetAccount[]>([]);
  readonly accounts = this.accountsSignal.asReadonly();

  async loadAccounts() {
    const accounts = await firstValueFrom(this.http.get<FleetAccount[]>(this.apiUrl));
    this.accountsSignal.set(accounts);
    return accounts;
  }

  async getAccount(id: string) {
    return firstValueFrom(this.http.get<FleetAccount>(`${this.apiUrl}/${id}`));
  }

  async createAccount(account: Partial<FleetAccount>) {
    const newAccount = await firstValueFrom(
      this.http.post<FleetAccount>(this.apiUrl, account)
    );
    this.accountsSignal.update((accounts) => [...accounts, newAccount]);
    return newAccount;
  }

  async updateAccount(id: string, updates: Partial<FleetAccount>) {
    const updated = await firstValueFrom(
      this.http.patch<FleetAccount>(`${this.apiUrl}/${id}`, updates)
    );
    this.accountsSignal.update((accounts) =>
      accounts.map((a) => (a._id === id ? updated : a))
    );
    return updated;
  }

  async approveAccount(id: string) {
    return firstValueFrom(
      this.http.patch<FleetAccount>(`${this.apiUrl}/${id}/approve`, {})
    );
  }

  async suspendAccount(id: string) {
    return firstValueFrom(
      this.http.patch<FleetAccount>(`${this.apiUrl}/${id}/suspend`, {})
    );
  }

  async addVehicle(id: string, vehicle: FleetVehicle) {
    return firstValueFrom(
      this.http.post<FleetAccount>(`${this.apiUrl}/${id}/vehicles`, vehicle)
    );
  }

  async addDriver(id: string, driver: FleetDriver) {
    return firstValueFrom(
      this.http.post<FleetAccount>(`${this.apiUrl}/${id}/drivers`, driver)
    );
  }

  async addCard(id: string, card: Partial<FleetCard>) {
    return firstValueFrom(
      this.http.post<FleetAccount>(`${this.apiUrl}/${id}/cards`, card)
    );
  }

  async recordPayment(id: string, amount: number, paymentMethod: string) {
    return firstValueFrom(
      this.http.post<FleetAccount>(`${this.apiUrl}/${id}/payment`, {
        amount,
        paymentMethod,
      })
    );
  }
}
