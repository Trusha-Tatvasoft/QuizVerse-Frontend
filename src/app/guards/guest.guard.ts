import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/auth/services/auth.service';
import { firstValueFrom } from 'rxjs';

export const guestGuard: CanActivateFn = async (): Promise<
  boolean | ReturnType<Router['parseUrl']>
> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  let token = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();
  let isValid = token && !authService.isTokenExpired(token);

  if (!isValid && refreshToken) {
    token = await firstValueFrom(authService.refreshAccessToken());
    isValid = !!token;
  }

  if (isValid) {
    const role = authService.getRoleFromToken(token || '')?.toLowerCase();
    const target = role === 'admin' ? '/admin' : '/user';
    return router.parseUrl(target);
  }

  return true;
};
