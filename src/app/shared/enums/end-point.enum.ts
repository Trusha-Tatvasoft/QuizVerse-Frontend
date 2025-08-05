export enum EndPoints {
  LandingPageData = 'LandingPage/get-landing-page-data',
  UserTableData = 'Users/get-users-by-pagination',
  UserExport = 'Users/user-export-data',
  ForgotPassword = 'Authentication/forgot-password',
  ResetPassword = 'Authentication/reset-password',
  RegisterUser = 'Authentication/register-user',
  VerifyTokenRestPassword = 'Authentication/verify-token-reset-password',
  AdminDashboardData = 'AdminDashboard/get-statistics-data',
  getUserEngagementData = 'AdminDashboard/get-user-engagement-data',
  getPerformaceScoreData = 'AdminDashboard/get-performance-score-data',
  getRevenueTrendData = 'AdminDashboard/get-revenue-trend-data',
}
