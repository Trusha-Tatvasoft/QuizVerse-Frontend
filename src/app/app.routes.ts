import { Routes } from '@angular/router';
import { Navigations } from './shared/enums/navigation';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { resetPasswordTokenGuard } from './guards/reset-password-token.guard';

import { LandingPageComponent } from './pages/layout/landing-page/landing-page.component';
import { LoginSignupComponent } from './core/auth/components/login-signup/login-signup.component';
import { ForgotPasswordComponent } from './core/auth/components/forgot-password/forgot-password.component';
import { ResetLinkSendSuccessfullyComponent } from './core/auth/components/reset-link-send-successfully/reset-link-send-successfully.component';
import { ResetLinkInvalidComponent } from './core/auth/components/reset-link-invalid/reset-link-invalid.component';
import { ResetPasswordComponent } from './core/auth/components/reset-password/reset-password.component';
import { MasterLayoutComponent } from './pages/layout/master-layout/master-layout.component';
import { CardComponent } from './shared/components/card/card.component';
import { UserManagementComponent } from './pages/admin/user-management/user-management.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    canActivate: [guestGuard],
    title: 'Quizeverse | LandingPage',
  },
  {
    path: Navigations.Login,
    component: LoginSignupComponent,
    canActivate: [guestGuard],
    title: 'Quizeverse | Login',
  },
  {
    path: Navigations.ForgetPassword,
    component: ForgotPasswordComponent,
    canActivate: [guestGuard],
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
    canActivate: [resetPasswordTokenGuard],
    title: 'Quizeverse | Reset Password',
  },
  {
    path: Navigations.Admin,
    component: MasterLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: Navigations.Users,
        component: UserManagementComponent,
        title: 'Quizeverse | User Management',
      },
    ],
  },
  {
    path: Navigations.User,
    component: MasterLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: Navigations.Users,
        component: CardComponent,
        title: 'Quizeverse | User Management',
      },
    ],
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
    title: 'QuizVerse | Unauthorized',
  },
];
