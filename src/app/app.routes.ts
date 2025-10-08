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
import { EmailTemplateComponent } from './pages/admin/email-template/email-template.component';
import { UserLeaderboardComponent } from './pages/user/user-leaderboard/user-leaderboard.component';
import { UserProfileComponent } from './pages/user/user-profile/user-profile.component';
import { PlatformSettingsComponent } from './pages/admin/platform-settings/platform-settings.component';
import { BattleCreationLayoutComponent } from './pages/admin/battle-management/components/battle-creation-layout/battle-creation-layout.component';
import { UserBattlesComponent } from './pages/user/user-battles/user-battles.component';
import { BrowseQuizzesComponent } from './pages/user/browse-quizzes/browse-quizzes.component';
import { QuizAttemptLayoutComponent } from './pages/user/quiz-attempt-layout/quiz-attempt-layout.component';
import { QuizInstructionsComponent } from './pages/user/quiz-attempt-layout/quiz-instructions/quiz-instructions.component';
import { QuestionDifficultyComponent } from './pages/admin/question-difficulty/question-difficulty.component';
import { QuizResultPageComponent } from './pages/user/quiz-result-page/quiz-result-page.component';
import { SearchOpponentComponent } from './pages/user/user-battles/search-opponent/search-opponent.component';
import { NotificationCenterComponent } from './pages/layout/notification-center/notification-center.component';
import { FoundOpponentComponent } from './pages/user/user-battles/found-opponent/found-opponent.component';
import { BattleInstructionComponent } from './pages/user/battle-attempt-layout/battle-instruction/battle-instruction.component';
import { BattleAttemptLayoutComponent } from './pages/user/battle-attempt-layout/battle-attempt-layout.component';
import { AdminProfileComponent } from './pages/admin/admin-profile/admin-profile.component';
import { BattleResultComponent } from './pages/user/battle-result/battle-result.component';
import { WaitingBattleResultComponent } from './pages/user/battle-result/components/waiting-battle-result/waiting-battle-result.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

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
      {
        path: Navigations.EmailTemplates,
        title: 'Quizeverse | Email Templates',
        component: EmailTemplateComponent,
      },
      {
        path: Navigations.Settings,
        component: PlatformSettingsComponent,
        title: 'Quizeverse | Platform Settings',
      },
      {
        path: Navigations.BattlesAdmin,
        title: 'Quizeverse | Battle Management',
        children: [{ path: Navigations.BattleCreation, component: BattleCreationLayoutComponent }],
      },
      {
        path: Navigations.BattlesAdmin,
        title: 'Quizeverse | Battle Management',
        children: [
          { path: `${Navigations.BattleUpdation}/:id`, component: BattleCreationLayoutComponent },
        ],
      },
      {
        path: Navigations.QuestionDifficulty,
        component: QuestionDifficultyComponent,
        title: 'Quizeverse | Question Difficulty',
      },
      {
        path: Navigations.Notifications,
        component: NotificationCenterComponent,
        title: 'Quizeverse | Notification Center',
      },
      {
        path: Navigations.Profile,
        component: AdminProfileComponent,
        title: 'Quizeverse | Question Difficulty',
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
        path: Navigations.Profile,
        component: UserProfileComponent,
        title: 'Quizeverse | Profile ',
      },
      {
        path: Navigations.Users,
        component: CardComponent,
        title: 'Quizeverse | User Management',
      },
      {
        path: Navigations.Leaderboards,
        component: UserLeaderboardComponent,
        title: 'Quizeverse | User Leaderboards',
      },
      {
        path: Navigations.Battles,
        children: [
          {
            path: `${Navigations.BattleList}`,
            component: UserBattlesComponent,
            title: 'Quizeverse | User Battles',
          },
          {
            path: `${Navigations.BattleList}/${Navigations.SearchOpponent}/:id`,
            component: SearchOpponentComponent,
            title: 'Quizeverse | Search Opponent',
          },
          {
            path: `${Navigations.BattleList}/${Navigations.BattleResult}/:id`,
            component: BattleResultComponent,
            title: 'Quizeverse | Battle Result',
          },
          {
            path: `${Navigations.BattleList}/${Navigations.WaitingBattleResult}/:id`,
            component: WaitingBattleResultComponent,
            title: 'Quizeverse | Waiting For Battle Result',
          },
        ],
      },
      {
        path: Navigations.QuizList,
        title: 'Quizeverse | Browse Quizzes',
        children: [
          { path: `${Navigations.BrowseQuizzes}`, component: BrowseQuizzesComponent },
          {
            path: `${Navigations.BrowseQuizzes}/${Navigations.QuizInstruction}/:id`,
            component: QuizInstructionsComponent,
            title: 'Quizeverse | Quiz Play Instructions',
          },
          {
            path: `${Navigations.BrowseQuizzes}/${Navigations.QuizResult}/:id`,
            component: QuizResultPageComponent,
            title: 'Quizeverse | Quiz Result',
          },
        ],
      },
      {
        path: Navigations.Notifications,
        component: NotificationCenterComponent,
        title: 'Quizeverse | Notification Center',
      },
    ],
  },
  {
    path: Navigations.User,
    canActivate: [authGuard],
    data: { roles: ['player'] },
    children: [
      {
        path: Navigations.QuizList,
        title: 'Quizeverse | Play Quizzes',
        children: [
          { path: `${Navigations.QuizAttempt}/:id`, component: QuizAttemptLayoutComponent },
        ],
      },
      {
        path: Navigations.Battles,
        title: 'Quizeverse | Play Battle',
        children: [
          {
            path: `${Navigations.BattleList}/${Navigations.FoundOpponent}/:id`,
            component: FoundOpponentComponent,
            title: 'Quizeverse | Found Opponent',
          },
          {
            path: `${Navigations.BattleList}/${Navigations.BattleInstruction}/:id`,
            component: BattleInstructionComponent,
            title: 'Quizeverse | Battle Instruction',
          },
          {
            path: `${Navigations.BattleAttempt}/:id`,
            component: BattleAttemptLayoutComponent,
            title: 'Quizeverse | Play Battle',
          },
        ],
      },
    ],
  },
  {
    path: Navigations.Unauthorized,
    component: UnauthorizedComponent,
    title: 'QuizVerse | Unauthorized',
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'QuizVerse | Page Not Found',
  },
];
