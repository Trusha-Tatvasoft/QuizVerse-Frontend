import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  map,
  mapTo,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import { LoginCredentials } from '../interfaces/login.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import {
  ACCESS_TOKEN_EXPIRY_MINUTES,
  ACCESS_TOKEN_KEY,
  PlatformMessages,
  REFRESH_TOKEN_EXPIRY_DAYS,
  REFRESH_TOKEN_KEY,
  REMEMBER_ME_EXPIRY_DAYS,
  ROLE_CLAIM_KEY,
} from '../../../utils/constants';
import { EndPoints } from '../../../shared/enums/end-point.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.baseUrl;

  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);
  private readonly cookieService = inject(CookieService);

  currentRole$ = new BehaviorSubject<string | null>(null);

  constructor(private readonly http: HttpClient) {
    const token = this.getAccessToken();
    if (token) {
      this.currentRole$.next(this.getRoleFromToken(token));
    }
  }

  saveTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false) {
    const now = new Date();
    const accessExpiry = new Date(now.getTime() + ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000);
    const refreshExpiry = new Date(
      now.getTime() +
        (rememberMe ? REMEMBER_ME_EXPIRY_DAYS : REFRESH_TOKEN_EXPIRY_DAYS) * 24 * 60 * 60 * 1000,
    );

    this.cookieService.set(ACCESS_TOKEN_KEY, accessToken, { expires: accessExpiry, path: '/' });
    this.cookieService.set(REFRESH_TOKEN_KEY, refreshToken, { expires: refreshExpiry, path: '/' });

    this.currentRole$.next(this.getRoleFromToken(accessToken));
  }

  setAccessToken(token: string) {
    const now = new Date();
    const accessExpiry = new Date(now.getTime() + ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    this.cookieService.set(ACCESS_TOKEN_KEY, token, { expires: accessExpiry, path: '/' });
    this.currentRole$.next(this.getRoleFromToken(token));
  }

  getAccessToken(): string | null {
    return this.cookieService.get(ACCESS_TOKEN_KEY) || null;
  }

  getRefreshToken(): string | null {
    return this.cookieService.get(REFRESH_TOKEN_KEY) || null;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getRoleFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload[ROLE_CLAIM_KEY];
      return role?.toLowerCase() || null;
    } catch {
      this.router.navigate([PlatformMessages.loginRedirectMessage]); // use route const if defined
      return null;
    }
  }

  hasRole(role: string): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const userRole = this.getRoleFromToken(token);
    return userRole === role;
  }

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.snackbar.showError(
        PlatformMessages.sessionExpiredTitle,
        PlatformMessages.noRefreshTokenMessage,
      );
      return EMPTY;
    }

    return this.http
      .post<
        ApiResponse<{ accessToken: string; refreshToken?: string }>
      >(`${this.API}/${EndPoints.RefreshToken}`, JSON.stringify(refreshToken), { headers: { 'Content-Type': 'application/json' } })
      .pipe(
        switchMap((response) => {
          if (!response.result || response.statusCode !== 200 || !response.data.accessToken) {
            this.snackbar.showError(
              PlatformMessages.tokenRefreshFailedTitle,
              response.message || PlatformMessages.tokenRefreshFailedMessage,
            );
            return EMPTY;
          }

          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken || refreshToken;
          this.saveTokens(newAccessToken, newRefreshToken);
          return of(newAccessToken);
        }),
        catchError((error) => {
          const message =
            error?.error?.message || error?.message || PlatformMessages.tokenInvalidMessage;
          this.snackbar.showError(PlatformMessages.sessionExpiredTitle, message);
          return of('');
        }),
      );
  }

  isTokenExpired(token: string, bufferSeconds = 60): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      return currentTime >= expiryTime - bufferSeconds * 1000;
    } catch {
      return true;
    }
  }

  verifyResetPasswordToken(token: string): Observable<boolean> {
    return this.http
      .post<
        ApiResponse<boolean>
      >(`${this.API}/${EndPoints.VerifyResetPasswordToken}`, { resetPasswordToken: token })
      .pipe(map((response) => response.data));
  }

  login(credentials: LoginCredentials): Observable<void> {
    return this.http
      .post<
        ApiResponse<{ accessToken: string; refreshToken?: string }>
      >(`${this.API}/${EndPoints.Login}`, credentials)
      .pipe(
        tap((response) => {
          const { accessToken, refreshToken } = response.data;
          this.saveTokens(accessToken, refreshToken || '', credentials.rememberMe);
        }),
        map(() => undefined),
      );
  }

  logout() {
    this.cookieService.delete(ACCESS_TOKEN_KEY, '/');
    this.cookieService.delete(REFRESH_TOKEN_KEY, '/');
    this.currentRole$.next(null);
  }
}
