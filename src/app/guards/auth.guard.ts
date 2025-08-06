import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../core/auth/services/auth.service';
import { SnackbarService } from '../shared/service/snackbar/snackbar.service';
import { PlatformMessages } from '../utils/constants';
import { Navigations } from '../shared/enums/navigation';

export const authGuard: CanActivateFn = async (route: ActivatedRouteSnapshot): Promise<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackbar = inject(SnackbarService);

  const publicOnly = route.data?.['publicOnly'] || false;
  const allowedRoles: string[] = route.data?.['roles'] || [];

  let token = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();
  let isValid = token && !authService.isTokenExpired(token);

  if (!isValid && refreshToken) {
    token = await firstValueFrom(authService.refreshAccessToken());
    isValid = !!token;
  }

  if (publicOnly && isValid) {
    const roleString = authService.getRoleFromToken(token || '')?.toLowerCase();
    const target = roleString === 'admin' ? `/${Navigations.Admin}` : `/${Navigations.User}`;
    router.navigate([target]);
    return false;
  }

  if (!publicOnly && !isValid) {
    router.navigate([Navigations.Login]);
    return false;
  }

  if (allowedRoles.length > 0) {
    const roleString = authService.getRoleFromToken(token || '')?.toLowerCase();
    if (!roleString || !allowedRoles.includes(roleString)) {
      router.navigate([Navigations.Unauthorized]);
      snackbar.showError(PlatformMessages.unauthorizedTitle, PlatformMessages.unauthorizedAccess);
      return false;
    }
  }

  return true;
};
