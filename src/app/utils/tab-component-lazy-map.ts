import { Type } from '@angular/core';

/**
 * tabLazyComponentMap
 * --------------------
 * Maps tab IDs to dynamic component loaders for lazy-loaded tab components.
 * Used by TabComponent to load components dynamically when a tab is activated.
 */
export const tabLazyComponentMap: Record<string, () => Promise<Type<unknown>>> = {
  'page-header': () =>
    import('../shared/components/page-header/page-header.component').then(
      (m) => m.PageHeaderComponent,
    ),
  'filled-button': () =>
    import('../shared/components/filled-button/filled-button.component').then(
      (m) => m.FilledButtonComponent,
    ),
  'login-form': () =>
    import('../core/auth/components/login/login.component').then((m) => m.LoginComponent),
  'register-form': () =>
    import('../core/auth/components/register/register.component').then((m) => m.RegisterComponent),

  // Admin Question Pool Tabs
  'manual-question-tab': () =>
    import(
      '../pages/admin/question-pool/components/manual-question-tab/manual-question-tab.component'
    ).then((m) => m.ManualQuestionTabComponent),
  'import-question-form': () =>
    import(
      '../pages/admin/question-pool/components/manual-question-tab/components/import-question-form/import-question-form.component'
    ).then((m) => m.ImportQuestionFormComponent),
  'create-edit-question-form': () =>
    import(
      '../pages/admin/question-pool/components/manual-question-tab/components/create-edit-question-form/create-edit-question-form.component'
    ).then((m) => m.CreateEditQuestionFormComponent),

  'ai-question-tab': () =>
    import(
      '../pages/admin/question-pool/components/ai-question-tab/ai-question-tab.component'
    ).then((m) => m.AiQuestionTabComponent),
  'from-text': () =>
    import(
      '../pages/admin/question-pool/components/ai-question-tab/components/from-text/from-text.component'
    ).then((m) => m.FromTextComponent),
  'from-pdf': () =>
    import(
      '../pages/admin/question-pool/components/ai-question-tab/components/from-pdf/from-pdf.component'
    ).then((m) => m.FromPdfComponent),
  'from-web-page': () =>
    import(
      '../pages/admin/question-pool/components/ai-question-tab/components/from-web-page/from-web-page.component'
    ).then((m) => m.FromWebPageComponent),

  // Player Profile Tabs
  'profile-overview': () =>
    import('../pages/user/user-profile/components/user-overview/user-overview.component').then(
      (m) => m.UserOverviewComponent,
    ),
  achievements: () =>
    import(
      '../pages/user/user-profile/components/user-achievement/user-achievement.component'
    ).then((m) => m.UserAchievementComponent),
  settings: () =>
    import(
      '../pages/user/user-profile/components/user-profile-setting/user-profile-setting.component'
    ).then((m) => m.UserProfileSettingComponent),

  // User Battles Tabs
  available: () =>
    import('../pages/user/user-battles/available-battles/available-battles.component').then(
      (m) => m.AvailableBattlesComponent,
    ),

  recent: () =>
    import('../pages/user/user-battles/recent-battles/recent-battles.component').then(
      (m) => m.RecentBattlesComponent,
    ),

  userBattleLeaderboard: () =>
    import('../pages/user/user-battles/battles-leaderboard/battles-leaderboard.component').then(
      (m) => m.BattlesLeaderboardComponent,
    ),

  // browse quizzes tabs
  featured: () =>
    import('../pages/user/browse-quizzes/components/quiz-list/quiz-list.component').then(
      (m) => m.QuizListComponent,
    ),
  'all quizzes': () =>
    import('../pages/user/browse-quizzes/components/quiz-list/quiz-list.component').then(
      (m) => m.QuizListComponent,
    ),
  free: () =>
    import('../pages/user/browse-quizzes/components/quiz-list/quiz-list.component').then(
      (m) => m.QuizListComponent,
    ),
  premium: () =>
    import('../pages/user/browse-quizzes/components/quiz-list/quiz-list.component').then(
      (m) => m.QuizListComponent,
    ),

  // user leaderboards tabs
  global: () =>
    import('../pages/user/user-leaderboard/global-rankings/global-rankings.component').then(
      (m) => m.GlobalRankingsComponent,
    ),

  weekly: () =>
    import('../pages/user/user-leaderboard/weekly-leaders/weekly-leaders.component').then(
      (m) => m.WeeklyLeadersComponent,
    ),

  category: () =>
    import('../pages/user/user-leaderboard/category-leaders/category-leaders.component').then(
      (m) => m.CategoryLeadersComponent,
    ),

  monthly: () =>
    import('../pages/user/user-leaderboard/monthly-champions/monthly-champions.component').then(
      (m) => m.MonthlyChampionsComponent,
    ),

  'notification status': () =>
    import(
      '../pages/layout/notification-center/components/notification-card/notification-card.component'
    ).then((m) => m.NotificationCardComponent),

  // content moderation tabs
  reportedQuizzes: () =>
    import(
      '../pages/layout/notification-center/components/notification-card/notification-card.component'
    ).then((m) => m.NotificationCardComponent),

  flaggedComments: () =>
    import(
      '../pages/admin/content-moderation/components/flagged-comments/flagged-comments.component'
    ).then((m) => m.FlaggedCommentsComponent),
  reportedQuestions: () =>
    import(
      '../pages/admin/content-moderation/components/reported-questions/reported-questions.component'
    ).then((m) => m.ReportedQuestionsComponent),
};
