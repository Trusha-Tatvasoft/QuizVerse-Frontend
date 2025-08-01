// src/app/guards/reset-password-token.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/auth/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { SnackbarService } from '../shared/service/snackbar/snackbar.service';
import { PlatformMessages } from '../utils/constants';

export const resetPasswordTokenGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const snackbar = inject(SnackbarService);
  const authService = inject(AuthService);
  const token = route.queryParamMap.get('token');

  if (!token) {
    snackbar.showError(PlatformMessages.invalidOrExpiredToken);
    return router.parseUrl('/forgot-password');
  }

  try {
    await firstValueFrom(authService.verifyResetPasswordToken(token));
    return true;
  } catch (err) {
    snackbar.showError(PlatformMessages.invalidOrExpiredToken);
    return router.parseUrl('/forgot-password');
  }
};
