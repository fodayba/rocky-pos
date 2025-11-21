import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { User, LoginCredentials, AuthToken, UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly currentUserSignal = signal<User | null>(null);

  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = computed(() => this.currentUser() !== null);
  public readonly userRole = computed(() => this.currentUser()?.role ?? null);

  constructor(
    private storage: StorageService,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const authToken = this.storage.getItem<AuthToken>(this.AUTH_TOKEN_KEY);
    if (authToken && new Date(authToken.expiresAt) > new Date()) {
      this.currentUserSignal.set(authToken.user);
    } else {
      this.storage.removeItem(this.AUTH_TOKEN_KEY);
    }
  }

  login(credentials: LoginCredentials): Promise<User> {
    return new Promise((resolve, reject) => {
      // For MVP, we'll use mock authentication
      // TODO: Replace with actual API call
      const mockUsers = this.getMockUsers();
      const user = mockUsers.find(u =>
        u.username === credentials.username &&
        credentials.password === 'password123' // Mock password
      );

      if (user) {
        const authToken: AuthToken = {
          token: this.generateMockToken(),
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
          user
        };

        this.storage.setItem(this.AUTH_TOKEN_KEY, authToken);
        this.currentUserSignal.set(user);
        resolve(user);
      } else {
        reject(new Error('Invalid credentials'));
      }
    });
  }

  logout(): void {
    this.storage.removeItem(this.AUTH_TOKEN_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  private generateMockToken(): string {
    return 'mock_token_' + Math.random().toString(36).substring(2);
  }

  private getMockUsers(): User[] {
    // Mock users for development
    return [
      {
        id: '1',
        username: 'admin',
        email: 'admin@rocky-pos.com',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        username: 'manager',
        email: 'manager@rocky-pos.com',
        role: 'manager',
        firstName: 'Manager',
        lastName: 'User',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        username: 'cashier',
        email: 'cashier@rocky-pos.com',
        role: 'cashier',
        firstName: 'Cashier',
        lastName: 'User',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // For development: Get available mock users
  getMockCredentials(): { username: string; password: string; role: UserRole }[] {
    return [
      { username: 'admin', password: 'password123', role: 'admin' },
      { username: 'manager', password: 'password123', role: 'manager' },
      { username: 'cashier', password: 'password123', role: 'cashier' }
    ];
  }
}
