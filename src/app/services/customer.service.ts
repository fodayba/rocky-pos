import { Injectable, signal } from '@angular/core';
import { Customer, LoyaltyTransaction } from '../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly CUSTOMERS_KEY = 'customers';
  private readonly LOYALTY_TRANSACTIONS_KEY = 'loyalty_transactions';

  private customersSignal = signal<Customer[]>([]);
  private loyaltyTransactionsSignal = signal<LoyaltyTransaction[]>([]);

  public readonly customers = this.customersSignal.asReadonly();
  public readonly loyaltyTransactions = this.loyaltyTransactionsSignal.asReadonly();

  constructor(private storage: StorageService) {
    this.loadCustomers();
    this.loadLoyaltyTransactions();
  }

  private loadCustomers(): void {
    const stored = this.storage.getItem<Customer[]>(this.CUSTOMERS_KEY);
    if (stored) {
      this.customersSignal.set(stored);
    } else {
      this.customersSignal.set([]);
    }
  }

  private loadLoyaltyTransactions(): void {
    const stored = this.storage.getItem<LoyaltyTransaction[]>(this.LOYALTY_TRANSACTIONS_KEY);
    if (stored) {
      this.loyaltyTransactionsSignal.set(stored);
    } else {
      this.loyaltyTransactionsSignal.set([]);
    }
  }

  addCustomer(customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpent' | 'visitCount' | 'createdAt'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: this.generateId(),
      loyaltyPoints: 0,
      totalSpent: 0,
      visitCount: 0,
      createdAt: new Date()
    };

    const customers = [...this.customersSignal(), newCustomer];
    this.customersSignal.set(customers);
    this.storage.setItem(this.CUSTOMERS_KEY, customers);

    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const customers = this.customersSignal();
    const index = customers.findIndex(c => c.id === id);

    if (index === -1) return null;

    const updated = { ...customers[index], ...updates };
    const newCustomers = [...customers];
    newCustomers[index] = updated;

    this.customersSignal.set(newCustomers);
    this.storage.setItem(this.CUSTOMERS_KEY, newCustomers);

    return updated;
  }

  recordPurchase(customerId: string, transactionId: string, amount: number): boolean {
    const customer = this.getCustomerById(customerId);
    if (!customer) return false;

    // Award 1 point per dollar spent
    const pointsEarned = Math.floor(amount);

    const loyaltyTxn: LoyaltyTransaction = {
      id: this.generateId(),
      customerId,
      transactionId,
      pointsEarned,
      pointsRedeemed: 0,
      date: new Date()
    };

    const loyaltyTransactions = [...this.loyaltyTransactionsSignal(), loyaltyTxn];
    this.loyaltyTransactionsSignal.set(loyaltyTransactions);
    this.storage.setItem(this.LOYALTY_TRANSACTIONS_KEY, loyaltyTransactions);

    this.updateCustomer(customerId, {
      loyaltyPoints: customer.loyaltyPoints + pointsEarned,
      totalSpent: customer.totalSpent + amount,
      visitCount: customer.visitCount + 1,
      lastVisit: new Date()
    });

    return true;
  }

  redeemPoints(customerId: string, points: number): boolean {
    const customer = this.getCustomerById(customerId);
    if (!customer || customer.loyaltyPoints < points) return false;

    this.updateCustomer(customerId, {
      loyaltyPoints: customer.loyaltyPoints - points
    });

    return true;
  }

  searchCustomers(query: string): Customer[] {
    const lowerQuery = query.toLowerCase();
    return this.customersSignal().filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.email?.toLowerCase().includes(lowerQuery) ||
      c.phone?.includes(query)
    );
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customersSignal().find(c => c.id === id);
  }

  private generateId(): string {
    return 'cust_' + Date.now() + '_' + Math.random().toString(36).substring(2);
  }
}
