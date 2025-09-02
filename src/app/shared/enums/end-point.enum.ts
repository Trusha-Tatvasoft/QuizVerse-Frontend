export enum EndPoints {
  //#region Common
  LandingPageData = 'LandingPage/get-landing-page-data',
  DropDownData = 'DropDownData/get-dropdown-data',
  DownloardSampleCsv = 'assets/templates/sampleCsv.csv',
  DownloardSampleExcel = 'assets/templates/sampleExcel.xlsx',
  //#endregion

  //#region Authentication
  Login = 'authentication/login',
  RefreshToken = 'authentication/refersh-token',
  VerifyResetPasswordToken = 'authentication/verify-token-reset-password',
  ForgotPassword = 'Authentication/forgot-password',
  ResetPassword = 'Authentication/reset-password',
  RegisterUser = 'Authentication/register-user',
  VerifyTokenRestPassword = 'Authentication/verify-token-reset-password',
  UserNameAvailable = 'Authentication/is-username-available',
  EmailAvailable = 'Authentication/is-email-available',
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
  CreateOrUpdateQuestion = 'QuestionPool/create-or-update-question',
  SaveQuestions = 'QuestionPool/save-questions',
  PreviewQuestionsFromCsv = 'QuestionPool/preview-questions-from-csv',
  PreviewQuestionsFromExcel = 'QuestionPool/preview-questions-from-excel',
  // #endregion

  // #region QuizCategory
  CreateOrUpdateQuizCategory = 'QuizCategory/create-or-update-quiz-category',
  GetQuizCategoryById = 'QuizCategory/get-quiz-category-by-id',
  UpdateQuizCategoryByAction = 'QuizCategory/update-quiz-category-by-action',
  CheckQuizCategoryNameAvailable = 'QuizCategory/is-category-name-available',
  // #endregion

  // #region QuizManagement
  QuizManagementStats = 'QuizManagement/get-quiz-card-data',
  QuizTableData = 'QuizManagement/get-quizzes-by-pagination',
  CreateOrUpdateQuiz = 'QuizManagement/create-update-quiz',
  GetQuizById = 'QuizManagement/get-quiz-by-id',
  ExportQuestions = 'QuizManagement/export-questions-to-csv',
  DeleteQuiz = 'QuizManagement/delete-quiz',
  // #endregion

  // #region BattleManagement
  BattleManagementList = 'BattleManagement/get-battle-list',
  CreateOrUpdateBattle = 'BattleManagement/create-update-battle',
  GetBattleById = 'BattleManagement/get-battle-by-id',
  DeleteBattle = 'BattleManagement/delete-Battle',
  //#endregion

  // #region QuestionDifficulty
  QuestionDifficultyXP = 'QuestionDifficulty/get-battle-question-difficulty-data',
  //#endregion

  // #region EmailTemplate
  EmailTemplateList = 'EmailTemplates/get-all-email-templates',
  //#endregion

  // #region UserLeaderboards
  UserLeaderboardStats = 'Leaderboard/get-user-leaderboard-stats',
  GlobalLeaderboard = 'Leaderboard/get-leaderboard-gloabal-ranking',
  //#endregion
}
