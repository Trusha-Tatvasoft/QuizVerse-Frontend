import { Routes } from '@angular/router';
import { Navigations } from './shared/enums/navigation';

import { LoginSignupComponent } from './core/auth/components/login-signup/login-signup.component';
import { ForgotPasswordComponent } from './core/auth/components/forgot-password/forgot-password.component';
import { ResetLinkSendSuccessfullyComponent } from './core/auth/components/reset-link-send-successfully/reset-link-send-successfully.component';
import { ResetLinkInvalidComponent } from './core/auth/components/reset-link-invalid/reset-link-invalid.component';
import { ResetPasswordComponent } from './core/auth/components/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: Navigations.Login,
    component: LoginSignupComponent,
    pathMatch: 'full',
  },
  {
    path: Navigations.ForgetPassword,
    component: ForgotPasswordComponent,
    pathMatch: 'full',
  },
  {
    path: Navigations.ResetPasswordLinkSuccess,
    component: ResetLinkSendSuccessfullyComponent,
    pathMatch: 'full',
  },
  {
    path: Navigations.ResetLinkInvalid,
    component: ResetLinkInvalidComponent,
    pathMatch: 'full',
  },
  {
    path: Navigations.ResetPassword,
    component: ResetPasswordComponent,
    pathMatch: 'full',
  },
];
