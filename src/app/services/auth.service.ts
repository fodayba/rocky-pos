import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { User, LoginCredentials, UserRole } from '../models';
import { environment } from '../../environments/environment';

interface LoginResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly currentUserSignal = signal<User | null>(null);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = computed(() => this.currentUser() !== null);
  public readonly userRole = computed(() => this.currentUser()?.role ?? null);

  constructor() {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    try {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('currentUser');

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        this.currentUserSignal.set(user);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      this.clearAuth();
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Store token and user
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSignal.set(response.user);
      }),
      map(response => response.user),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSignal.set(null);
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  // For development: Get available mock credentials
  getMockCredentials(): { username: string; password: string; role: UserRole }[] {
    return [
      { username: 'admin', password: 'password123', role: 'admin' },
      { username: 'manager', password: 'password123', role: 'manager' },
      { username: 'cashier', password: 'password123', role: 'cashier' }
    ];
  }
}
