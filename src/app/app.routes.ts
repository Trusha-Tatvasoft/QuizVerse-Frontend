import { Routes } from '@angular/router';
import { Navigations } from './shared/enums/navigation';
import { authGuard } from './guards/auth.guard';
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
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { QuestionPoolComponent } from './pages/admin/question-pool/question-pool.component';
import { QuizCategoriesManagementComponent } from './pages/admin/quiz-categories/quiz-categories-management.component';
import { QuizDifficultyLevelComponent } from './pages/admin/quiz-difficulty-level/quiz-difficulty-level.component';
import { BattleManagementComponent } from './pages/admin/battle-management/battle-management.component';
import { QuizManagementComponent } from './pages/admin/quiz-management/quiz-management.component';
import { QuizCreationLayoutComponent } from './pages/admin/quiz-management/components/quiz-creation-layout/quiz-creation-layout.component';
import { UserDashboardComponent } from './pages/user/user-dashboard/user-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    canActivate: [authGuard],
    data: { publicOnly: true },
    title: 'Quizeverse | LandingPage',
  },
  {
    path: Navigations.Login,
    component: LoginSignupComponent,
    canActivate: [authGuard],
    data: { publicOnly: true },
    title: 'Quizeverse | Login',
  },
  {
    path: Navigations.ForgetPassword,
    component: ForgotPasswordComponent,
    canActivate: [authGuard],
    data: { publicOnly: true },
    title: 'Quizeverse | Forgot Password',
  },
  {
    path: Navigations.ResetPasswordLinkSuccess,
    component: ResetLinkSendSuccessfullyComponent,
    canActivate: [authGuard],
    data: { publicOnly: true },
    title: 'Quizeverse | Link Sent',
  },
  {
    path: Navigations.ResetLinkInvalid,
    component: ResetLinkInvalidComponent,
    canActivate: [authGuard],
    data: { publicOnly: true },
    title: 'Quizeverse | Invalid Link',
  },
  {
    path: Navigations.ResetPassword,
    component: ResetPasswordComponent,
    canActivate: [authGuard],
    data: { publicOnly: true },
    title: 'Quizeverse | Reset Password',
  },
  {
    path: Navigations.Admin,
    component: MasterLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: Navigations.Dashboard,
        component: AdminDashboardComponent,
        title: 'Quizeverse | Admin Dashboard ',
      },
      {
        path: Navigations.Users,
        component: UserManagementComponent,
        title: 'Quizeverse | User Management',
      },
      {
        path: Navigations.Quizzes,
        component: QuizManagementComponent,
        title: 'Quizeverse | Quiz Management',
      },
      {
        path: Navigations.Categories,
        component: QuizCategoriesManagementComponent,
        title: 'Quizeverse | Quiz Categories Management',
      },
      {
        path: Navigations.Difficulties,
        component: QuizDifficultyLevelComponent,
        title: 'Quizeverse | Difficulty Level',
      },
      {
        path: Navigations.BattlesAdmin,
        component: BattleManagementComponent,
        title: 'Quizeverse | Battle Management',
      },
      {
        path: Navigations.QuestionPool,
        component: QuestionPoolComponent,
        title: 'Quizeverse | Question Pool Management',
      },
      {
        path: Navigations.Quizzes,
        title: 'Quizeverse | Quiz Management',
        children: [{ path: Navigations.QuizCreation, component: QuizCreationLayoutComponent }],
      },
      {
        path: Navigations.Quizzes,
        title: 'Quizeverse | Quiz Management',
        children: [
          { path: `${Navigations.QuizCreation}/:id`, component: QuizCreationLayoutComponent },
        ],
      },
    ],
  },
  {
    path: Navigations.User,
    component: MasterLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['player'] },
    children: [
      {
        path: Navigations.Dashboard,
        component: UserDashboardComponent,
        title: 'Quizeverse | Dashboard ',
      },
      {
        path: Navigations.Users,
        component: CardComponent,
        title: 'Quizeverse | User Management',
      },
    ],
  },
  {
    path: Navigations.Unauthorized,
    component: UnauthorizedComponent,
    title: 'QuizVerse | Unauthorized',
  },
];
