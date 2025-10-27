import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../core/auth/services/auth.service';
import { SnackbarService } from '../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../utils/constants';
import { Navigations } from '../shared/enums/navigation';
import { MatDialog } from '@angular/material/dialog';
import { Role } from '../shared/enums/role';

export const authGuard: CanActivateFn = async (route: ActivatedRouteSnapshot): Promise<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackbar = inject(SnackbarService);
  const dialog = inject(MatDialog);

  const publicOnly = route.data?.['publicOnly'] || false;
  const allowedRoles: string[] = route.data?.['roles'] || [];

  let token = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();
  let isValid = token && !authService.isTokenExpired(token);

  if (!isValid && refreshToken) {
    try {
      token = await firstValueFrom(authService.refreshAccessToken());
      isValid = !!token;
    } catch {
      dialog.closeAll();
      authService.logout(false);
      isValid = false;
    }
  }

  if (publicOnly && isValid) {
    const roleString = authService.getRoleFromToken(token || '')?.toLowerCase();
    const target = getRedirectPath(roleString);
    router.navigate([target]);
    return false;
  }

  if (!publicOnly && !isValid) {
    dialog.closeAll();
    router.navigate([Navigations.Login]);
    return false;
  }

  if (allowedRoles.length > 0) {
    const roleString = authService.getRoleFromToken(token || '')?.toLowerCase();
    if (!roleString || !allowedRoles.includes(roleString)) {
      router.navigate([Navigations.Unauthorized]);
      snackbar.showError(platformMessages.unauthorizedTitle, platformMessages.unauthorizedAccess);
      return false;
    }
  }

  return true;
};

function getRedirectPath(role: string | undefined): string {
  switch (role) {
    case Role.SuperAdmin:
    case Role.Admin:
      return `/${Navigations.Admin}/${Navigations.Dashboard}`;
    case Role.Player:
      return `/${Navigations.User}/${Navigations.Dashboard}`;
    default:
      return `/${Navigations.Login}`;
  }
}
