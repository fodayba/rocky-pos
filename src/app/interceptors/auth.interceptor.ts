import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Get token from localStorage (only in browser)
  const token = isBrowser ? localStorage.getItem('token') : null;

  // Clone request and add authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error) => {
      // If 401 Unauthorized, redirect to login
      if (error.status === 401) {
        if (isBrowser) {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
