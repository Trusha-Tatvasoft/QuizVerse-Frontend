import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, BehaviorSubject, EMPTY, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

import { AuthService } from '../core/auth/services/auth.service';
import { SnackbarService } from '../shared/service/snackbar/snackbar.service';
import { Router } from '@angular/router';
import { platformMessages } from '../utils/constants';
import { Navigations } from '../shared/enums/navigation';
import { EndPoints } from '../shared/enums/end-point.enum';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const snackbar = inject(SnackbarService);
  const router = inject(Router);

  if (req.url.includes(EndPoints.RefreshToken)) {
    return next(req);
  }

  let authReq = req;
  const accessToken = authService.getAccessToken();

  if (accessToken && authService.isTokenExpired(accessToken)) {
    return refreshAndRetry(req, next, authService);
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
        case 400:
          return throwError(() => error);

        case 401:
          return refreshAndRetry(authReq, next, authService);

        case 403:
          router.navigate([Navigations.Unauthorized]);
          snackbar.showError(platformMessages.accessDeniedTitle, backendMessage);
          break;

        case 404:
          snackbar.showError(platformMessages.notFoundTitle, backendMessage);
          break;

        case 500:
          snackbar.showError(platformMessages.serverErrorTitle, backendMessage);
          break;

        default:
          snackbar.showError(platformMessages.errorTitle, platformMessages.unavailableMessage);
          break;
      }

      return EMPTY;
    }),
  );
};

function refreshAndRetry(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshAccessToken().pipe(
      switchMap((newToken: string) => {
        isRefreshing = false;

        if (!newToken) {
          authService.logout(false);
          return EMPTY;
        }

        refreshTokenSubject.next(newToken);
        return next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          }),
        );
      }),
      catchError(() => {
        isRefreshing = false;
        authService.logout(false);
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
