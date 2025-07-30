import { Routes } from '@angular/router';
import { Navigations } from './shared/enums/navigation';

import { LandingPageComponent } from './pages/layout/landing-page/landing-page.component';
import { LoginSignupComponent } from './core/auth/components/login-signup/login-signup.component';
import { ForgotPasswordComponent } from './core/auth/components/forgot-password/forgot-password.component';
import { ResetLinkSendSuccessfullyComponent } from './core/auth/components/reset-link-send-successfully/reset-link-send-successfully.component';
import { ResetLinkInvalidComponent } from './core/auth/components/reset-link-invalid/reset-link-invalid.component';
import { ResetPasswordComponent } from './core/auth/components/reset-password/reset-password.component';
import { UserManagementComponent } from './pages/admin/user-management/user-management.component';
import { MasterLayoutComponent } from './pages/layout/master-layout/master-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'Quizeverse | LandingPage',
  },
  {
    path: Navigations.Login,
    component: LoginSignupComponent,
    title: 'Quizeverse | Login',
  },
  {
    path: Navigations.ForgetPassword,
    component: ForgotPasswordComponent,
    title: 'Quizeverse | Forgot Password',
  },
  {
    path: Navigations.ResetPasswordLinkSuccess,
    component: ResetLinkSendSuccessfullyComponent,
    title: 'Quizeverse | Link Sent',
  },
  {
    path: Navigations.ResetLinkInvalid,
    component: ResetLinkInvalidComponent,
    title: 'Quizeverse | Invalid Link',
  },
  {
    path: Navigations.ResetPassword,
    component: ResetPasswordComponent,
    title: 'Quizeverse | Reset Password',
  },
  {
    path: 'Admin',
    component: MasterLayoutComponent,
    children: [{ path: 'user-management', component: UserManagementComponent }],
  },
];
