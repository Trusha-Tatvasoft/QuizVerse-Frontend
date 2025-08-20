export enum EndPoints {
  //#region Common
  LandingPageData = 'LandingPage/get-landing-page-data',
  DropDownData = 'DropDownData/get-dropdown-data',
  //#endregion

  //#region Authentication
  Login = 'authentication/login',
  RefreshToken = 'authentication/refersh-token',
  VerifyResetPasswordToken = 'authentication/verify-token-reset-password',
  ForgotPassword = 'Authentication/forgot-password',
  ResetPassword = 'Authentication/reset-password',
  RegisterUser = 'Authentication/register-user',
  VerifyTokenRestPassword = 'Authentication/verify-token-reset-password',
  // #endregion

  // #region Admin DashBoard
  AdminDashboardData = 'AdminDashboard/get-statistics-data',
  getUserEngagementData = 'AdminDashboard/get-user-engagement-data',
  getPerformaceScoreData = 'AdminDashboard/get-performance-score-data',
  getRevenueTrendData = 'AdminDashboard/get-revenue-trend-data',
  // #endregion

  // #region User Management
  UserTableData = 'Users/get-users-by-pagination',
  UserExport = 'Users/user-export-data',
  GetUserById = 'Users/get-user-by-id',
  CreateOrUpdateUser = 'Users/create-or-update-user',
  UpdateUserStatusByAction = 'Users/update-user-status-by-action',
  // #endregion

  // #region QuizCategory
  QuizCategoryTableData = 'QuizCategory/get-quiz-categories',
  // #endregion

  // #region QuizDifficultyLevel
  QuizDifficultyLevel = 'QuizDifficultyLevel/get-quiz-difficulty-list',
  QuizDifficultyNameAvailable = 'QuizDifficultyLevel/is-difficulty-name-available',
  CreateQuizDifficultyLevel = 'QuizDifficultyLevel/create-difficulty-level',
  // #endregion

  // #region QuestionPool
  QuestionPoolList = 'QuestionPool/get-question-pool-list',
  DeleteQuestion = 'QuestionPool/delete-question',
  GetQuestionPrevirew = 'QuestionPool/get-question-preview',
  // #endregion

  // #region QuizCategory
  CreateOrUpdateQuizCategory = 'QuizCategory/create-or-update-quiz-category',
  GetQuizCategoryById = 'QuizCategory/get-quiz-category-by-id',
  UpdateQuizCategoryByAction = 'QuizCategory/update-quiz-category-by-action',
  CheckQuizCategoryNameAvailable = 'QuizCategory/is-category-name-available',
  // #endregion

  // #region QuizManagement
  QuizManagementStats = 'QuizManagement/get-quiz-card-data',
  // #endregion

  // #region BattleManagement
  BattleManagementList = 'BattleManagement/get-battle-list',
  //#endregion
}
