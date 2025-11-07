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
  UpdateQuizAction = 'QuizManagement/update-quiz-action',
  // #endregion

  // #region BattleManagement
  BattleManagementList = 'BattleManagement/get-battle-list',
  CreateOrUpdateBattle = 'BattleManagement/create-update-battle',
  GetBattleById = 'BattleManagement/get-battle-by-id',
  DeleteBattle = 'BattleManagement/delete-Battle',
  //#endregion

  // #region QuestionDifficulty
  QuestionDifficultyXP = 'QuestionDifficulty/get-battle-question-difficulty-data',
  GetAllQuestionDifficulties = 'QuestionDifficulty/get-question-difficulties',
  DeleteQuestionDifficulty = 'QuestionDifficulty/delete-question-difficulty',
  QuestionDifficultyNameAvailable = 'QuestionDifficulty/is-question-difficulty-name-available',
  QuestionDifficultyXPAvailable = 'QuestionDifficulty/is-question-difficulty-xp-available',
  CreateOrUpdateQuestionDifficultyLevel = 'QuestionDifficulty/add-or-edit-question-difficulty',
  //#endregion

  // #region EmailTemplate
  EmailTemplateList = 'EmailTemplates/get-all-email-templates',
  UpdateEmailTemplateByAction = 'EmailTemplates/update-email-template-by-action',
  GetEmailTemplateById = 'EmailTemplates/get-email-template-by-id',
  AddOrEditEmailTemplate = 'EmailTemplates/add-or-edit-email-template',
  //#endregion

  // #region UserLeaderboards
  UserLeaderboardStats = 'Leaderboard/get-user-leaderboard-stats',
  GlobalLeaderboard = 'Leaderboard/get-leaderboard-gloabal-ranking',
  WeeklyLeaderboard = 'Leaderboard/get-weekly-leaderboard-ranking',
  CategoryLeaderboard = 'Leaderboard/get-category-wise-leaderboard',
  MonthlyChampions = 'Leaderboard/get-monthly-champions',
  AvailableYears = 'Leaderboard/get-available-years',
  AvailableMonths = 'Leaderboard/get-available-months',
  //#endregion

  // #region UserDashboard
  UserDashboardData = 'UserDashboard/get-statistics-data',
  RankProgressData = 'UserDashboard/get-rank-progress',
  GetFeaturedQuizzes = 'UserDashboard/get-featured-quizzes',
  GetBattleRequests = 'UserDashboard/get-battle-requests',
  UpdateBattleRequestStatus = 'UserDashboard/update-battle-request-status',
  GetRecentQuizzes = 'UserDashboard/get-recent-quizzes',
  // #endregion

  // #region UserProfile
  GetUserBasicProfile = 'UserProfile/get-user-basic-profile',
  GetUserOverview = 'UserProfile/get-user-overview',
  GetUserBadges = 'UserProfile/get-user-badges',
  UpdateProfilePic = 'UserProfile/update-profile-pic',
  GetUserProfileSetting = 'UserProfile/get-user-profile-setting',
  CheckEmailAvailable = 'UserProfile/is-email-available',
  SendOtp = 'UserProfile/send-otp-to-user',
  VerifyOtp = 'UserProfile/verify-otp',
  UpdateUserProfile = 'UserProfile/update-user-profile',
  NavbarData = 'UserProfile/get-user-navbar-data',
  GetAdminProfile = 'UserProfile/get-admin-profile',
  UpdateAdminProfile = 'UserProfile/update-admin-profile',
  // #endregion

  // #region PlateformSetting
  GetPlateformSetting = 'PlatformConfiguration/get-platform-configurations',
  UpdatePlateformSetting = 'PlatformConfiguration/update-platform-configurations',
  // #endregion

  // #region UserBattles
  GetBattleLeaderboardList = 'UserBattles/get-battle-leaderboard-list',
  GetUserAvailableBattles = 'UserBattles/get-user-available-battles',
  GetUserRecentBattles = 'UserBattles/get-user-battle-history',
  SendBattleRequest = 'UserBattles/send-battle-request',
  CheckUserExistence = 'UserBattles/check-user-existence',
  SearchUser = 'UserBattles/search-user',
  GetBattleInstruction = 'UserBattles/get-battle-instructions',
  GetBattleResult = 'UserBattles/get-battle-result',
  //#endregion

  // #region BrowseQuizzes
  BrowseQuizzes = 'BrowseQuizzes/browse-quizzes',
  AddQuizReport = 'Quiz/add-edit-quiz-report',
  // #endregion

  // #region QuizAttempt
  getQuizInstructions = 'Quiz/get-quiz-overview',
  StartQuiz = 'Quiz/start-quiz',
  GetNextQuestion = 'Quiz/get-quiz-question',
  GetAnswerExplaination = 'Quiz/get-answer-explanation',
  saveAndGetNextQuestion = 'Quiz/save-and-next-question',
  submitQuiz = 'Quiz/submit-quiz',
  // #endregion

  //  #region Quiz-result
  QuizCompletedSummary = 'Quiz/quiz-summary', // GET /quiz/quiz-summary/{quizId}
  QuizQuestionReview = 'Quiz/quiz-question-review', // GET /quiz/question-review/{quizId}
  QuizAnswerExplanation = 'Quiz/answer-explanation', // POST /quiz/answer-explanation
  ReportQuestionIssue = 'Quiz/report-question-issue',
  QuizRating = 'Quiz/quiz-rating',
  SubmitQuizRating = 'Quiz/submit-quiz-rating',
  //  #endregion

  //#region Notification Center
  NotificationCenter = 'NotificationCenter/get-all-notifications',
  MarkAsAllRead = 'NotificationCenter/mark-as-all-read',
  MarkAsRead = 'NotificationCenter/mark-read',
  //#endregion

  // #region AI Configuration
  AiConfigurationCardData = 'AiConfiguration/get-ai-configuration-card-details',
  AiUsageDetails = 'AiConfiguration/get-ai-uses-details',
  //#endregion
}
