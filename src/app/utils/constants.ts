import { AiModelName } from '../shared/enums/ai-configuration.enum';
import { EmailTemplateType } from '../shared/enums/email-template.enum';
import { Navigations } from '../shared/enums/navigation';
import { TagInputConfig } from '../shared/interfaces/tag-component.interface';
import { CardColor } from './types/card-component.type';
import { TagColor, TagType } from './types/tag-component.type';

//#region snackbar - constant
export const snackbarDuration = 5000;
export const snackbarHorizontalPosition = 'end';
export const snackbarVerticalPostion = 'bottom';
//#endregion

//#region AppColors
export const appColors = {
  adminBackgroundColor: 'linear-gradient(to right, #fff4f2, #fffaf6)',
  adminTextColor: 'rgb(153 27 27 / var(--tw-text-opacity, 1))',
  adminBorderColor: 'rgb(254 202 202 / var(--tw-border-opacity, 1))',
  adminSubtitleColor: 'rgb(185 28 28 / var(--tw-text-opacity, 1))',

  userBackgroundColor: 'linear-gradient(to right, #eff6ff, #e0f2fe)', // soft blue tones
  userTextColor: '#1e40af',
  userBorderColor: '#bfdbfe',
  userSubtitleColor: '#1d4ed8',

  quizBackgroundColor: 'linear-gradient(to right, #ecebff, #f3f4ff)', // violet tones
  quizTextColor: '#3730a3',
  quizBorderColor: '#c7d2fe',
  quizSubtitleColor: '#4338ca',

  queDifficultyBackgroundColor: 'linear-gradient(to right, #f3e8ff, #faf5ff)', // purple pastel
  queDifficultyTextColor: '#6b21a8',
  queDifficultyBorderColor: '#e9d5ff',
  queDifficultySubtitleColor: '#7e22ce',

  quizDifficultyBackgroundColor: 'linear-gradient(to right, #fff7ed, #fff3e0)', // soft orange
  quizDifficultyTextColor: '#9a3412',
  quizDifficultyBorderColor: '#fed7aa',
  quizDifficultySubtitleColor: '#c2410c',

  emailBackgroundColor: 'linear-gradient(to right, #eff6ff, #e0f2fe)', // same as user
  emailTextColor: '#1e40af',
  emailBorderColor: '#bfdbfe',
  emailSubtitleColor: '#1d4ed8',

  financialBackgroundColor: 'linear-gradient(to right, #ecfdf5, #d1fae5)', // mint green
  financialTextColor: '#065f46',
  financialBorderColor: '#a7f3d0',
  financialSubtitleColor: '#047857',

  darkText: '#333',
};
//#endregion

//#region Common Table Pagination Config
export const tablePaginationConfig = {
  PageSize: 5,
  TotalItems: 0,
  PageSizeOptions: [5, 10, 20],
};
//#endregion

//#region navBar Config
export const yellow: TagInputConfig = {
  id: '0',
  label: 'warning',
  type: 'static' as TagType,
  backgroundColor: 'lightYellow' as TagColor,
  textColor: 'yellow' as TagColor,
  isSelected: false,
  hasBorder: true,
};

export const green: TagInputConfig = {
  id: '0',
  label: 'success',
  type: 'static' as TagType,
  backgroundColor: 'lightGreen' as TagColor,
  textColor: 'green' as TagColor,
  isSelected: false,
  hasBorder: true,
};

export const red: TagInputConfig = {
  id: '0',
  label: 'error',
  type: 'static' as TagType,
  backgroundColor: 'lightRed' as TagColor,
  textColor: 'red' as TagColor,
  isSelected: false,
  hasBorder: true,
};

export const blue: TagInputConfig = {
  id: '0',
  label: 'info',
  type: 'static' as TagType,
  backgroundColor: 'lightBlue' as TagColor,
  textColor: 'blue' as TagColor,
  isSelected: false,
  hasBorder: true,
};
//#endregion

//#region NavigationItems
export const navigationItems = {
  UserRoutes: [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: `${Navigations.User}/${Navigations.Dashboard}`,
    },
    {
      label: 'Browse Quizzes',
      icon: 'quiz',
      route: `${Navigations.User}/${Navigations.QuizList}/${Navigations.BrowseQuizzes}`,
    },
    {
      label: 'Battles',
      icon: 'sports_kabaddi',
      route: `${Navigations.User}/${Navigations.Battles}/${Navigations.BattleList}`,
    },
    {
      label: 'Tournaments',
      icon: 'sports_esports',
      route: `${Navigations.User}/${Navigations.Tournaments}`,
    },
    {
      label: 'Leaderboard',
      icon: 'emoji_events',
      route: `${Navigations.User}/${Navigations.Leaderboards}`,
    },
    { label: 'Profile', icon: 'person', route: `${Navigations.User}/${Navigations.Profile}` },
  ],

  AdminRoutes: [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: `${Navigations.Admin}/${Navigations.Dashboard}`,
    },
    { label: 'User Management', icon: 'group', route: `${Navigations.Admin}/${Navigations.Users}` },
    {
      label: 'Quiz Management',
      icon: 'quiz',
      route: `${Navigations.Admin}/${Navigations.Quizzes}`,
    },
    {
      label: 'Quiz Categories',
      icon: 'category',
      route: `${Navigations.Admin}/${Navigations.Categories}`,
    },
    {
      label: 'Difficulty Levels',
      icon: 'signal_cellular_alt',
      route: `${Navigations.Admin}/${Navigations.Difficulties}`,
    },
    {
      label: 'Battle Management',
      icon: 'sports_kabaddi',
      route: `${Navigations.Admin}/${Navigations.BattlesAdmin}`,
    },
    {
      label: 'Question Pool',
      icon: 'inventory_2',
      route: `${Navigations.Admin}/${Navigations.QuestionPool}`,
    },
    {
      label: 'Question Difficulty',
      icon: 'bar_chart',
      route: `${Navigations.Admin}/${Navigations.QuestionDifficulty}`,
    },
    {
      label: 'Email Templates',
      icon: 'email',
      route: `${Navigations.Admin}/${Navigations.EmailTemplates}`,
    },
    {
      label: 'Platform Settings',
      icon: 'settings',
      route: `${Navigations.Admin}/${Navigations.Settings}`,
    },
    {
      label: 'Notification Center',
      icon: 'notifications',
      route: `${Navigations.Admin}/${Navigations.Notifications}`,
    },
    {
      label: 'Content Moderation',
      icon: 'warning',
      route: `${Navigations.Admin}/${Navigations.ContentModeration}`,
    },
    {
      label: 'AI Configuration',
      icon: 'electric_bolt',
      route: `${Navigations.Admin}/${Navigations.AiConfig}`,
    },
  ],
};
//#endregion

//#region Constants Messages
export const plateformName = 'QuizVerse';

export const platformMessages = {
  errorTitle: `Error!`,
  successTitle: `Success!`,
  errorMessage: `Something went wrong.`,
  resetLinkSendSuccessfully: `Reset link sent successfully.`,
  passwordResetSuccess: `Password reset successfully.`,
  noDataAvailable: `No data available to export.`,
  errorExport: `Export failed.`,
  registerSuccessfully: `Register Successfully!!`,
  unexpectedError: 'An unexpected error occurred. Please try again later.',
  dropDownLoadFailed: 'Failed to load the Dropdowns',

  //#region authMessages
  loginRedirectMessage: 'Redirecting to login.',
  unauthorizedTitle: 'Unauthorized',
  unauthorizedAccess: 'No access for this page.',
  invalidOrExpiredToken: 'Invalid token or Token Expired!!',
  logoutSuccess: 'Logged out successfully.',
  //#endregion

  //#region auth Interceptor Errors
  accessDeniedTitle: 'Access Denied',
  notFoundTitle: 'Not Found',
  serverErrorTitle: 'Server Error',
  unavailableMessage: 'Server Unavailable',
  sessionExpiredTitle: 'Session expired',
  sessionExpiredMessage: 'Please log in again.',
  infoTitle: 'Info',
  //#endregion

  //#region registerMessages
  emailExists: 'Email already exists.',
  usernameExists: 'Username already exists.',
  welcomeTitle: 'Welcome to QuizVerse!!',
  successfullLogin: 'You have been successfully logged in',
  //#endregion

  //#region QuestionPool Messages
  failedLoadQuesPreview: 'Failed to load question details',
  deleteQuesSuccess: 'Question Deleted Successfully!!',
  deleteQuesFailure: 'Failed to delete question',
  noQuestionsToSave: 'No questions to save.',
  saveQuestionsSuccess: 'Questions added successfully.',
  saveQuestionsFailure: 'Something went wrong while saving questions.',

  selectRequiredField: 'Please select all required fields.',
  maxNoOfQueLimit: 'Total number of questions cannot exceed 10.',
  uploadFileRequired: 'Please Uplaod a file',
  aiConfigRequired: 'Please configure at least one question type',
  //#endregion

  //#region QuizManagement Messages
  deleteQuizSuccess: 'Quiz Deleted Successfully!!',
  deleteQuizFailure: 'Failed to delete quiz',
  //#endregion

  //#region profileMessages
  invalidImageType: 'Only JPG, PNG, and GIF image files are supported!',
  uploadSuccess: 'Profile photo updated successfully!',
  uploadFailed: 'Profile upload failed. Please try again.',
  loadProfileFailed: 'Failed to load user profile',
  emailAlreadyVerified: 'Email already verified.',
  otpLimitReached: 'OTP send limit reached for this email.',
  otpSendSuccess: 'OTP sent successfully.',
  otpSendFailed: 'Failed to send OTP.',
  otpVerifySuccess: 'OTP verified successfully.',
  otpVerifyFailed: 'OTP verification failed.',
  profileUpdateSuccess: 'Profile updated successfully.',
  profileUpdateFailed: 'Update failed.',
  verifyEmailBeforeSave: 'Please verify your new email before saving.',
  profileDeleteSuccess: 'Profile picture deleted successfully',
  profileDeleteFailure: 'Failed to delete profile picture',
  //#endregion

  //#region BattleManagement Messages
  battleSaved: 'Battle saved successfully!',
  battleUpdated: 'Battle updated successfully!',
  editBattleTitle: 'Edit Battle',
  editBattleSubtitle: 'Update battle information and settings',
  minimumNumberOfQuestionError: 'Total questions must be between 5 and 100.',
  maximumTotalTimeError: 'Total Time must be between 2 minutes and 180 minutes.',
  minimumTotalXPError: 'Total questions must be greater than 0.',
  deleteBattleSuccess: 'Battle Deleted Successfully!!',
  deleteBattleFailure: 'Failed to delete battle',
  invalideBattleId: 'Invalid battle id',
  totalQuestionsError: (count: number) =>
    `You need to select exactly ${count} questions to match your battle settings.`,
  difficultyWiseQuestionSelectionError: 'Please select the questions as per your battle settings.',
  battleTitleNotFoundError: 'Battle name not found',
  //#endregion

  //#region EmailTemplate Messages
  failedToFetchTemplate: 'Failed to fetch template.',
  failedToSaveTemplate: 'Failed to save template.',
  saveTemplateSuccess: 'Template saved successfully.',
  //#endregion

  //#region Quiz Attempt
  invalidQuizId: 'Invalid quiz id',
  startQuizMessage: 'Quiz Satrted. All the best!!!',
  restoreQuizData: 'Restored your previous quiz progress',
  areYouSureYouWantToLeaveMessage:
    'Your quiz progress will be saved. Are you sure you want to leave?',
  unKnownErrorMessage: 'Unknown error occurred',
  openedDeveloperTools: 'Developer tools opened',
  windowsLostFocus: 'Window lost focus',
  switchTab: 'Switched tab or minimized window',
  fullScreenExit: 'You exited fullscreen!',
  failedToExitFullScreen: 'Failed to exit fullscreen',
  timeUp: 'Time is up!',
  quizSubmitSuccess: 'Quiz submitted successfully!',
  lastQuestion: 'This is the last question cannot navigate further.',
  completedQuiz: 'You have already completed this quiz and cannot play again.',
  inspectOpen: 'Cannot start the quiz while developer tools are open.',
  inspectOpenBattle: 'Cannot start the battle while developer tools are open.',
  //#endregion

  // #region
  failedLoadQuizResultSummary: 'Failed to fetch loading quiz summary',
  failedLoadQuizExplaination: 'Failed to load quiz explaination',
  failedToFatchQuestions: 'Failed to fetch questions',
  // #endregion

  // #region User Battles
  cancelSearch: 'Search cancelled',
  matchMakingFailed: 'Failed to connect to matchmaking service',
  searchTimeOut: 'Search timed out. No opponents found.',
  battleResumed: 'Battle resumed successfully',

  // Request Messages for hub
  battleHubSearching: 'Searching',
  battleHubStartMatching: 'StartMatchmaking',
  battleHubCancelMatching: 'CancelMatchmaking',
  battleHubResumeBattle: 'ResumeBattle',
  battleHubBattleIntrupted: 'IntruptByPlayer',
  connectionFailed: 'Connection failed:',
  matchedWith: 'Matched with',
  connectionLost: 'Connection lost. Reconnecting...',
  connectionRestore: 'Connection restored',
  connectionClosedError: 'Connection closed unexpectedly',
  serverNotConnected: 'Not connected to server',
  failedtoStartMatching: 'Failed to start matchmaking',
  failedtoResumeBattle: 'Failed to resume battle',
  failedtoEndBattle: 'Failed to end battle',
  failedtoCancelMatching: 'Failed to cancel matchmaking',
  errorInConnection: 'Error stopping connection',
  battleEndedMessage: 'Battle ended!',
  battleResultFailedError: 'Failed to fetch battle result',
  battleNotCompletedError: 'Battle not completed yet!',
  // #endregion

  //#region Battle Instruction
  failBattleInstruction: 'Failed to load battle instruction',
  //#endregion

  // #region play battle
  battleHubMatchFound: 'MatchFound',
  battleError: 'Error',
  battleHubBattleStarted: 'BattleStarted',
  battleHubBattleResumed: 'BattleResumed',
  battleHubContinueBattle: 'ContinueBattle',
  battleHubReceiveQuestion: 'ReceiveQuestion',
  battleHubSubmitAnswer: 'SubmitAnswer',
  battleHubReceiveScoreUpdate: 'ReceiveScoreUpdate',
  battleHubLastAnsweredDetail: 'LastAnsweredDetail',
  battleHubPlayerInterrupted: 'PlayerInterrupted',
  battleHubBattleEndedForPlayer: 'BattleEndedForParticularPlayerDueToInterrupt',
  recieveBattleRequest: 'ReceiveBattleRequest',
  battleEnded: 'battleEnded',
  battleHubSkipInstruction: 'SkipInstructions',
  battleRequestAccepted: 'BattleRequestAccepted',
  battleRequestAcceptedConfirmation: 'BattleRequestAcceptedConfirmation',
  battleRequestCancelled: 'BattleRequestCancelled',
  battleRequestDeclined: 'BattleRequestDeclined',
  // Battle flow messages
  battleStart: 'Battle started! All the best!',
  timeoutNextQuestion: "Time's up! Moving to the next question...",
  invalidBattleId: 'Invalid battle id',
  answerSubmitFailed: 'Failed to submit answer',
  resumeBattleFailed: 'Failed to resume battle',
  alreadyAnsQuestion: 'Already answered this question.',
  opponentLeft: 'Your opponent has left the battle.',
  opponentBattleEnded: 'The battle has ended for your opponent.',
  battleComplted: 'Battle Completed!! Redirecting to result',
  battleResumeSuccess: 'Battle resumed successfully',
  battleHubError: 'Error',
  questionLoadFail: 'Falied to load Question',
  failedToSkipInstruction: 'Failed to skip instructions',
  failToIntrrupteBattle: 'Failed to interrupt battle',
  failedLoadUserBattles: 'Failed to fatch user battles',
  // #endregion

  // #region Content Moderation
  failedToLoadCommentPreview: 'Failed to load comment details',
  // #endregion
};
//#endregion

export const emailTemplateActionMessages = {
  activated: 'Email template activated successfully',
  inactivated: 'Email template inactivated successfully',
  deleted: 'Email template deleted successfully',
  statusUpdated: 'Email template status updated',
};

//#region Constant Variables
export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

export const defaultProfilePic = 'assets/images/profile.png';

export const allowedImportQuestionFileTypes = [
  'text/csv',
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];

export const allowedPDFType = 'application/pdf';

export const maxOtpAttempts = 2;

export const maxFileUploadSize = 10 * 1024 * 1024;

export const defaultLastLoginDate = '0001-01-01T00:00:00';

export const debounceTimeValue = 500;

//#region authToken Const
export const accessTokenKey = 'access_token';
export const refreshTokenKey = 'refresh_token';
export const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export const accessTokenExpiryMinutes = 30;
export const refreshTokenExpiryDays = 7;
export const rememberMeExpiryDays = 30;

// Functions to get expiry dates
export const getAccessTokenExpiryDate = () => {
  return new Date(Date.now() + accessTokenExpiryMinutes * 60 * 1000);
};

export const getRefreshTokenExpiryDate = (rememberMe: boolean) => {
  const days = rememberMe ? rememberMeExpiryDays : refreshTokenExpiryDays;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
//#endregion

export const userExportFilePrefix = 'User';

export const exportFileNameTemplate = '{prefix}_export_{date}.xlsx';

//#region User Management Constants
export const userActions = {
  EDIT: 'edit',
  DELETE: 'delete',
  BLOCK: 'block',
  ACTIVATE: 'check_circle_outline',
  INACTIVATE: 'remove_circle_outline',
};

export const userSaveMessages = {
  updated: 'updated',
  created: 'created',
  success: 'Success',
  error: 'Error',
  serverError: 'Server Error',
  successMessage: (action: string) => `User ${action} successfully`,
  errorMessage: (action: string) => `Failed to ${action} user`,
};

export const userActionMessages = {
  deleted: 'User deleted successfully',
  activated: 'User activated successfully',
  suspended: 'User suspended successfully',
  inactivated: 'User inactivated successfully',
  statusUpdated: 'User status updated',
};
//#endregion

export const dateFilterType = {
  last7Days: 'last7days',
  last30days: 'last30days',
  lastMonth: 'lastMonth',
  lastYear: 'lastYear',
  allTime: 'allTime',
};

export const filterOptions = [
  { label: 'Last 7 Days', value: dateFilterType.last7Days },
  { label: 'Last 30 Days', value: dateFilterType.last30days },
  { label: 'Last Month', value: dateFilterType.lastMonth },
  { label: 'Last Year', value: dateFilterType.lastYear },
  { label: 'All Time', value: dateFilterType.allTime },
];

export const quizRating = [1, 2, 3, 4, 5];

export const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

//#region Skip loader const
export const skipLoader = 'X-Skip-Loader';
//#endregion

//#region Question Action
export const questionAction = {
  EDIT: 'edit',
  DELETE: 'delete',
  VIEW: 'visibility',
};
//#endregion

//#region QuizCategory
export const defaultIcon = 'category';
export const updateCategory = 'Update Category';
//#endregion

//#region TagColors
export const colors = {
  green: { bg: 'lightGreen', text: 'green' },
  red: { bg: 'lightRed', text: 'red' },
  yellow: { bg: 'lightYellow', text: 'yellow' },
  blue: { bg: 'lightBlue', text: 'blue' },
  purple: { bg: 'lightPurple', text: 'purple' },
  orange: { bg: 'lightOrange', text: 'orange' },
  black: { bg: 'black', text: 'lightWhite' },
  white: { bg: 'lightWhite', text: 'black' },
  brown: { bg: 'lightBrown', text: 'brown' },
};
//#endregion

//#region Quiz Management Constants
export const quizActions = {
  VISIBILITY: 'visibility',
  EDIT: 'edit',
  DELETE: 'delete',
  ACTIVATE: 'check_circle_outline',
  INACTIVATE: 'remove_circle_outline',
};
//#endregion

//#region Quiz Crud Messages
export const quizCRUDMessages = {
  quizSaved: 'Quiz saved successfully!',
  editQuizTitle: 'Edit Quiz',
  editQuizSubtitle: 'Design and configure a quiz for the platform',
  quizDrafSaved: 'Quiz save as draft successfully!',
  featureNotAvailable: 'This feature is not available yet. Please select another method.',
  questionCreationMethodSelectError: 'Please select a question creation method.',
  totalQuestionsError: (count: number) =>
    `You need to select exactly ${count} questions to match your quiz settings.`,
  maxDifficultyQuestionsError: (difficultyLimit: number, difficultyName: string) =>
    difficultyLimit === 0
      ? `No ${difficultyName} questions allowed.`
      : `Max ${difficultyLimit} ${difficultyName} questions allowed.`,
  maxAIGenrationQuestionsError: (maxAiQuestions: number, currentTotal: number) =>
    `Cannot add. The maximum for AI generation is ${maxAiQuestions} questions. You have ${maxAiQuestions - currentTotal} remaining.`,
  uploadFileError: 'Please upload a PDF file',
  noFileSelectedError: 'No PDF file selected.',
  selectAIGenerationMethod: 'Please provide the content (text, URL, or PDF).',
  addAIQueGenerationConfiguration: 'Please add at least one AI configuration.',
  aiGenMethodError: 'Invalid generation method selected.',
  queGeneratedSUccess: 'Questions successfully created!',
  tryOtherGenSource: 'Please try another source.',
  errorWhileQueGeneration: 'Something went wrong while generating questions.',
  difficultyWiseQuestionSelectionError: 'Please select the questions as per your quiz settings.',
  minimumNumberOfQuestionError: 'Total questions must be between 5 and 100.',
  mcqOptionError: 'Correct answer must match one of the options.',
  fileTypeError: 'Select only Excel or csv.',
  invalideQuizId: 'Invalid quiz id',
  questionAdded: 'Question Added!',
  quizTitalNotFoundError: 'Quiz name not found',
  failedToExportQuestions: 'Failed to export questions.',
  duplicateQuestionError: 'A same question already exists in the list.',
  notUniqueOptions: 'Options must be unique.',
  maximumTotalTimeError: 'Total time must be between 2 and 180 minutes.',
  fillInTheBlankFormatError:
    'Question text must contain at least one "{{}}" placeholder for the blank.',
};
//#endregion

//#region Email Template
export const emailTemplateTypeLabels: Record<number, string> = {
  [EmailTemplateType.AccountSuspension]: 'Account Suspension',
  [EmailTemplateType.BattleRequest]: 'Battle Request',
  [EmailTemplateType.EmailVerification]: 'Email Verification',
  [EmailTemplateType.QuizInvitation]: 'Quiz Invitation',
  [EmailTemplateType.ResetPassword]: 'Reset Password',
  [EmailTemplateType.WelcomeEmail]: 'Welcome Email',
  [EmailTemplateType.NewUser]: 'New User Email',
};

export const emailActions = {
  EDIT: 'edit',
  DELETE: 'delete',
  PREVIEW: 'visibility',
  ACTIVATE: 'check_circle_outline',
  INACTIVATE: 'remove_circle_outline',
};

export const emailTemplatePlaceholdersRequired: Record<EmailTemplateType, string[]> = {
  [EmailTemplateType.AccountSuspension]: ['{{user}}', '{{email}}'],
  [EmailTemplateType.BattleRequest]: ['{{user}}', '{{opponent}}', '{{battleLink}}'],
  [EmailTemplateType.EmailVerification]: ['{{user}}', '{{email}}', '{{otp}}'],
  [EmailTemplateType.QuizInvitation]: ['{{user}}', '{{quizName}}', '{{quizLink}}'],
  [EmailTemplateType.ResetPassword]: ['{{user}}', '{{email}}', '{{resetLink}}'],
  [EmailTemplateType.WelcomeEmail]: [
    '{{user}}',
    '{{email}}',
    '{{registrationDate}}',
    '{{loginUrl}}',
    '{{year}}',
    '{{companyName}}',
  ],
  [EmailTemplateType.NewUser]: ['{{user}}', '{{password}}', '{{loginUrl}}'],
};
//#endregion

//#region Plateform Setting
export const plateformSettingCRUDMessages = {
  plateformSettingUpdated: 'Platform settings updated successfully',
  invalidFileType: 'Invalid file type. Please select an image.',
};

export const defaultLogoPath = 'assets/images/logo-small.png';
//#endregion

// #region user dashboard
export const valueColor: CardColor = 'black';

export const battleRequestMessages = {
  accepted: (userName: string) => `You accepted battle request from ${userName}`,
  declined: (userName: string) => `You declined battle request from ${userName}`,
  acceptFailed: (userName: string) => `Failed to accept battle request from ${userName}`,
  declineFailed: (userName: string) => `Failed to decline battle request from ${userName}`,
};

//#endregion

// #region Question Type
export const questionTypes = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  TRUE_FALSE: 'True/False',
  FILL_IN_THE_BLANK: 'Fill in the Blank',
  SHORT_ANSWER: 'Short Answer',
};
// #endregion

// #region Question Difficulty
export const questionDifficultyMessages = {
  deleteQuestionDifficulty: 'Question difficulty deleted successfully.',
};
// #endregion

// #region admin dashboard graph colors
export const adminDashboardChartColors = {
  // Bar chart
  bar: {
    border: '#4caf50',
    fill: '#a6f1a6',
  },

  // Doughnut chart
  doughnut: {
    border: '#7c3aed',
    fill: ['#ede9fe', '#ddd6fe', '#e0e7ff', '#f5f3ff'],
  },
};

// #region Quiz Play
export const quizPlayStateKey = 'quizAttemptState';

export function autoSubmitMessage(reason: string): string {
  return `Quiz will be auto-submitted due to: ${reason}`;
}
// #endregion

// #registrer component pattern
export const regexPatterns = {
  NAME: /^[A-Za-z][A-Za-z .'-]*$/,
  USERNAME: /^[a-zA-Z][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:,.<>\/\\|~]+$/,
  EMAIL: /^[^\s][a-zA-Z0-9._%+-]*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=\S*$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
  DESCRIPTION: /^$|^\S[\s\S]*$/,
  QUIZ_DIFFICULTY_NAME: /^[A-Za-z][A-Za-z0-9 ]*$/,
  CAMEL_CASE_REGEX: /([a-z])([A-Z])/g,
};
// #endregion

//#region Battle play
export function autoSubmitBattleMessage(reason: string): string {
  return `Battle will end automatically due to: ${reason}`;
}

export const battleInstructionsShowTime = 60; // seconds

export const battleIdStorageKey = 'battleAttemptId';

export const userIdClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata';

export const notificationTimeout = 30000;
// #endregion

//#region Question generation from web url
export const fetchContentFromUrlMessages = {
  enterValidUrl: 'Please enter a valid Web URL.',
  questionGeneratedSuccess: 'Questions generated successfully from the web page!',
  questionGeneratedFailed: 'Failed to generate questions from the web page.',
};
// #endregion

//#region AI Configuration
export const aiModelLabels: Record<keyof typeof AiModelName, string> = {
  Gemini2Point5FlashLite: 'gemini-2.5-flash-lite',
  Gemini2Point5Flash: 'gemini-2.5-flash',
  Gemini2Point0FlashLite: 'gemini-2.0-flash-lite',
  Gemini2Point0Flash: 'gemini-2.0-flash',
  Gemini2Point5Pro: 'gemini-2.5-pro',
  Gemini2Point0FlashExp: 'gemini-2.0-flash-exp',
  Llama3Point18BInstant: 'llama-3.1-8b-instant',
  Llama3Point370BVersatile: 'llama-3.3-70b-versatile',
  GroqCompound: 'groq/compound',
  MoonshotAiKimiK2Instruct: 'moonshotai/kimi-k2-instruct',
  OpenAiGptOss20B: 'openai/gpt-oss-20b',
};
//#endregion

//#region Flagged Comments Action
export const flaggedCommentsAction = {
  VIEW: 'message',
  ACCEPTED: 'check_circle',
  IGNORED: 'block',
};
//#endregion

//#region QUestion Report Action
export const questionReportAction = {
  VIEW: 'visibility',
  ACCEPTED: 'check_circle',
  IGNORED: 'block',
  PENDING: 'hourglass_empty',
  UNDERREVIEW: 'bookmark_added',
};

export const dialogCloseCorrectly = 'Dialogue closs correctly';
//#endregion
