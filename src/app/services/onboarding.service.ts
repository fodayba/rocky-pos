import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, retry, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface OnboardingProgress {
  welcomeViewed: boolean;
  locationSetup: boolean;
  completionViewed: boolean;
}

export interface OnboardingStatusDto {
  completed: boolean;
  completedAt?: Date;
  progress: OnboardingProgress;
}

export interface UpdateProgressDto {
  step: 'welcomeViewed' | 'locationSetup' | 'completionViewed';
}

export interface CreateLocationDto {
  storeNumber: string;
  name: string;
  storeFormat: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email?: string;
  timezone?: string;
  managerName?: string;
  operatingHours?: any;
  hasFuelPumps?: boolean;
  numberOfPumps?: number;
  hasMiniMart?: boolean;
  squareFootage?: number;
  defaultTaxRate?: number;
}

export interface Location {
  _id: string;
  storeNumber: string;
  name: string;
  storeFormat: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email?: string;
  timezone: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private readonly apiUrl = `${environment.apiUrl}/onboarding`;
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Handle HTTP errors with specific error messages and retry logic
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
   * Fetch the current user's onboarding status
   */
  getStatus(): Observable<OnboardingStatusDto> {
    return this.http.get<OnboardingStatusDto>(`${this.apiUrl}/status`).pipe(
      this.retryStrategy<OnboardingStatusDto>(),
      catchError(error => this.handleError(error, 'fetching onboarding status', false))
    );
  }

  /**
   * Update progress for a specific onboarding step
   */
  updateProgress(step: 'welcomeViewed' | 'locationSetup' | 'completionViewed'): Observable<OnboardingStatusDto> {
    const dto: UpdateProgressDto = { step };
    return this.http.patch<OnboardingStatusDto>(`${this.apiUrl}/progress`, dto).pipe(
      this.retryStrategy<OnboardingStatusDto>(),
      tap((status: OnboardingStatusDto) => {
        // Update auth service with new onboarding status
        this.authService.updateUserOnboardingStatus(status.completed, status.progress);
      }),
      catchError(error => this.handleError(error, 'updating onboarding progress', false))
    );
  }

  /**
   * Create a location during the onboarding process
   */
  createLocation(locationData: CreateLocationDto): Observable<Location> {
    return this.http.post<Location>(`${this.apiUrl}/location`, locationData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error creating location:', error);
        
        let errorMessage = 'Failed to create location. Please try again.';
        
        // Handle specific error cases with detailed messages
        if (error.status === 409) {
          errorMessage = 'Store number already exists. Please choose a different store number.';
        } else if (error.status === 400) {
          // Handle validation errors
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            // Handle field-specific validation errors
            const fieldErrors = error.error.errors;
            const firstError = Object.keys(fieldErrors)[0];
            errorMessage = `${firstError}: ${fieldErrors[firstError]}`;
          } else {
            errorMessage = 'Invalid location data. Please check all required fields.';
          }
        } else if (error.status === 422) {
          errorMessage = error.error?.message || 'Validation failed. Please check your input.';
        } else if (error.status === 0) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error. Please try again in a few moments.';
        }
        
        this.toastService.error(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Complete the onboarding process
   */
  completeOnboarding(): Observable<OnboardingStatusDto> {
    return this.http.post<OnboardingStatusDto>(`${this.apiUrl}/complete`, {}).pipe(
      this.retryStrategy<OnboardingStatusDto>(),
      tap((status: OnboardingStatusDto) => {
        // Update auth service with completed onboarding status
        this.authService.updateUserOnboardingStatus(status.completed, status.progress);
      }),
      catchError(error => this.handleError(error, 'completing onboarding', true))
    );
  }
}
