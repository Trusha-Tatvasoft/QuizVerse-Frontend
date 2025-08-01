import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/auth/services/auth.service';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SnackbarService } from '../shared/service/snackbar/snackbar.service';
import { PlatformMessages } from '../utils/constants';

export const authGuard: CanActivateFn = async (route: ActivatedRouteSnapshot): Promise<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackbar = inject(SnackbarService);

  let token = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();
  let isValid = token && !authService.isTokenExpired(token);

  if (!isValid && refreshToken) {
    token = await firstValueFrom(authService.refreshAccessToken());
    isValid = !!token;
  }

  if (!isValid) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getRoleFromToken(token || '')?.toLowerCase();
  const path = route.routeConfig?.path?.toLowerCase();

  if (path === 'admin' && role !== 'admin') {
    router.navigate(['/unauthorized']);
    snackbar.showError(
      PlatformMessages.unauthorizedTitle,
      PlatformMessages.unauthorizedAccessAdmin,
    );
    return false;
  }

  if (path === 'user' && role !== 'player') {
    router.navigate(['/unauthorized']);
    snackbar.showError(PlatformMessages.unauthorizedTitle, PlatformMessages.unauthorizedAccessUser);
    return false;
  }

  return true;
};
