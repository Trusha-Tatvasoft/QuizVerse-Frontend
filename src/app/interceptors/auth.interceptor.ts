import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

import { AuthService } from '../core/auth/services/auth.service';
import { SnackbarService } from '../shared/service/snackbar/snackbar.service';
import { Router } from '@angular/router';
import { PlatformMessages } from '../utils/constants';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<any> => {
  const authService = inject(AuthService);
  const snackbar = inject(SnackbarService);
  const router = inject(Router);

  let authReq = req;
  const accessToken = authService.getAccessToken();

  if (accessToken && authService.isTokenExpired(accessToken)) {
    return refreshAndRetry(req, next, authService, snackbar);
  }

  if (accessToken) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const backendMessage = error.statusText;

      switch (error.status) {
        case 401:
          return refreshAndRetry(authReq, next, authService, snackbar);

        case 403:
          router.navigate(['/unauthorized']);
          snackbar.showError(PlatformMessages.accessDeniedTitle, backendMessage);
          break;

        case 404:
          snackbar.showError(PlatformMessages.notFoundTitle, backendMessage);
          break;

        case 500:
          snackbar.showError(PlatformMessages.serverErrorTitle, backendMessage);
          break;

        default:
          snackbar.showError(PlatformMessages.errorTitle, PlatformMessages.unavailableMessage);
          break;
      }

      return EMPTY;
    }),
  );
};

function refreshAndRetry(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  snackbar: SnackbarService,
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshAccessToken().pipe(
      switchMap((newToken: string) => {
        isRefreshing = false;

        if (!newToken) {
          return EMPTY;
        }

        refreshTokenSubject.next(newToken);
        return next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          }),
        );
      }),
      catchError((err: HttpErrorResponse) => {
        isRefreshing = false;
        authService.logout();
        snackbar.showError(
          PlatformMessages.sessionExpiredTitle,
          PlatformMessages.sessionExpiredMessage,
        );
        return EMPTY;
      }),
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) =>
        next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          }),
        ),
      ),
    );
  }
}
