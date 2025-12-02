import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, retry, timer } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';
import { Location } from '../models/location.model';
import { UserRole } from '../models/user.model';

// Interfaces based on design document
export interface UserSettings {
  profile: UserProfile;
  preferences: UserPreferences;
  notifications: NotificationPreferences;
  security: SecuritySettings;
}

export interface UserProfile {
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  employeeId?: string;
  primaryLocation?: Location;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserPreferences {
  locale: string;
  theme: 'light' | 'dark' | 'system';
  displayDensity: 'compact' | 'comfortable' | 'spacious';
  rememberMe: boolean;
  sessionTimeout?: number;
}

export interface NotificationPreferences {
  email: {
    sales: boolean;
    inventory: boolean;
    system: boolean;
    security: boolean;
  };
  inApp: {
    sales: boolean;
    inventory: boolean;
    system: boolean;
    security: boolean;
  };
}

export interface SecuritySettings {
  lastPasswordChange?: Date;
  activeSessions: number;
  twoFactorEnabled: boolean;
}

export interface RecentActivity {
  id: string;
  action: string;
  timestamp: Date;
  details: string;
  ipAddress?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DataExportResponse {
  downloadUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Handle HTTP errors with specific error messages
   */
  private handleError(error: HttpErrorResponse, context: string, showToast = true): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Your session has expired. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = error.error?.message || 'A conflict occurred. Please try again.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation failed. Please check your input.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Error ${context}`;
      }
    }

    console.error(`${context}:`, error);
    
    if (showToast) {
      this.toastService.error(errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Retry strategy for network errors
   */
  private retryStrategy<T>() {
    return retry<T>({
      count: this.MAX_RETRIES,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Only retry on network errors or 5xx server errors
        if (error.status === 0 || error.status >= 500) {
          console.log(`Retry attempt ${retryCount} after ${this.RETRY_DELAY}ms`);
          return timer(this.RETRY_DELAY * retryCount);
        }
        // Don't retry on client errors (4xx)
        return throwError(() => error);
      }
    });
  }

  /**
   * Get all user settings
   */
  getUserSettings(userId: string): Observable<UserSettings> {
    return this.http.get<UserSettings>(`${this.apiUrl}/${userId}/settings`).pipe(
      this.retryStrategy<UserSettings>(),
      catchError(error => this.handleError(error, 'fetching user settings', false))
    );
  }

  /**
   * Update user profile information
   */
  updateProfile(userId: string, profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/${userId}/profile`, profile).pipe(
      catchError(error => this.handleError(error, 'updating profile', true))
    );
  }

  /**
   * Update user preferences
   */
  updatePreferences(userId: string, prefs: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http.patch<UserPreferences>(`${this.apiUrl}/${userId}/preferences`, prefs).pipe(
      catchError(error => this.handleError(error, 'updating preferences', true))
    );
  }

  /**
   * Update notification preferences
   */
  updateNotifications(userId: string, notifs: NotificationPreferences): Observable<NotificationPreferences> {
    return this.http.patch<NotificationPreferences>(`${this.apiUrl}/${userId}/notifications`, notifs).pipe(
      catchError(error => this.handleError(error, 'updating notifications', true))
    );
  }

  /**
   * Change user password
   */
  changePassword(userId: string, data: PasswordChangeData): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/password`, data).pipe(
      catchError(error => this.handleError(error, 'changing password', true))
    );
  }

  /**
   * Logout all sessions except current one
   */
  logoutAllSessions(userId: string): Observable<{ count: number }> {
    return this.http.post<{ count: number }>(`${this.apiUrl}/${userId}/sessions/logout-all`, {}).pipe(
      catchError(error => this.handleError(error, 'logging out sessions', true))
    );
  }

  /**
   * Get recent activity logs
   */
  getRecentActivity(userId: string, limit: number = 10): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.apiUrl}/${userId}/activity`, {
      params: { limit: limit.toString() }
    }).pipe(
      this.retryStrategy<RecentActivity[]>(),
      catchError(error => this.handleError(error, 'fetching recent activity', false))
    );
  }

  /**
   * Request data export
   */
  requestDataExport(userId: string): Observable<DataExportResponse> {
    return this.http.post<DataExportResponse>(`${this.apiUrl}/${userId}/export`, {}).pipe(
      catchError(error => this.handleError(error, 'requesting data export', true))
    );
  }

  /**
   * Delete user account
   */
  deleteAccount(userId: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/delete`, { password }).pipe(
      catchError(error => this.handleError(error, 'deleting account', true))
    );
  }
}
