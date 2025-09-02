import { EmailTemplateType } from '../shared/enums/email-template.enum';
import { Navigations } from '../shared/enums/navigation';
import { TagInputConfig } from '../shared/interfaces/tag-component.interface';
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
      route: `${Navigations.User}/${Navigations.BrowseQuizzes}`,
    },
    {
      label: 'Battles',
      icon: 'sports_kabaddi',
      route: `${Navigations.User}/${Navigations.Battles}`,
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
      label: 'AI Configuration',
      icon: 'smart_toy',
      route: `${Navigations.Admin}/${Navigations.AiConfig}`,
    },
    {
      label: 'Financial Management',
      icon: 'attach_money',
      route: `${Navigations.Admin}/${Navigations.Finance}`,
    },
    {
      label: 'Notification Center',
      icon: 'notifications',
      route: `${Navigations.Admin}/${Navigations.Notifications}`,
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

  //#region authMessages
  loginRedirectMessage: 'Redirecting to login.',
  unauthorizedTitle: 'Unauthorized',
  unauthorizedAccess: 'No access for this page.',
  invalidOrExpiredToken: 'Invalid token or Token Expired!!',
  //#endregion

  //#region auth Interceptor Errors
  accessDeniedTitle: 'Access Denied',
  notFoundTitle: 'Not Found',
  serverErrorTitle: 'Server Error',
  unavailableMessage: 'Server Unavailable',
  sessionExpiredTitle: 'Session expired',
  sessionExpiredMessage: 'Please log in again.',
  //#endregion

  //#region authService messages
  noRefreshTokenMessage: 'No refresh token found.',
  tokenRefreshFailedTitle: 'Token refresh failed',
  tokenRefreshFailedMessage: 'Unexpected response.',
  tokenInvalidMessage: 'Token refresh failed',
  //#endregion

  //#region QuestionPool Messages
  failedLoadQuesPreview: 'Failed to load question details',
  deleteQuesSuccess: 'Question Deleted Successfully!!',
  deleteQuesFailure: 'Failed to delete question',
  noQuestionsToSave: 'No questions to save.',
  saveQuestionsSuccess: 'Questions added successfully.',
  saveQuestionsFailure: 'Something went wrong while saving questions.',
  //#endregion

  //#region QuizManagement Messages
  deleteQuizSuccess: 'Quiz Deleted Successfully!!',
  deleteQuizFailure: 'Failed to delete quiz',
  //#endregion
};
//#endregion

//#region Constant Variables
export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

export const allowedImportQuestionFileTypes = [
  'text/csv',
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];

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

export const userLoadMessages = {
  fetchError: 'Failed to fetch user',
  serverError: 'Server error while fetching user',
  error: 'Error',
};

export const userStatusMessages = {
  actionFailed: 'Action failed',
  serverError: 'Server error during user action',
  success: 'Success',
  error: 'Error',
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
    `Please select the ${count} number of questions as per your quiz settings.`,
  maxDifficultyQuestionsError: (difficultyLimit: number, difficultyName: string) =>
    `Max ${difficultyLimit} ${difficultyName} questions allowed.`,
  difficultyWiseQuestionSelectionError: 'Please select the questions as per your quiz settings.',
  minimumNumberOfQuestionError: 'Total questions must be at least 5.',
  mcqOptionError: 'Correct answer must match one of the options.',
  fileTypeError: 'Select only Excel or csv.',
  invalideQuizId: 'Invalid quiz id',
  questionAdded: 'Question Added!',
  quizTitalNotFoundError: 'Quiz name not found',
  failedToExportQuestions: 'Failed to export questions.',
};
//#endregion

//#region Email Template
export const emailTemplateTypeLabels: Record<number, string> = {
  [EmailTemplateType.AccountSuspension]: 'Account Suspension',
  [EmailTemplateType.BattleRequest]: 'Battle Request',
  [EmailTemplateType.EmailVerification]: 'Email Verification',
  [EmailTemplateType.QuizInvitation]: 'Quiz Invitation',
  [EmailTemplateType.ResetPassword]: 'Reset Password',
  [EmailTemplateType.WelComeEmail]: 'Welcome Email',
};
//#endregion
