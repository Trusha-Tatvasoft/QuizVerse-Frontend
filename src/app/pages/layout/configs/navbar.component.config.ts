import { Navigations } from '../../../shared/enums/navigation';
import {
  AdminNotificationCategory,
  UserNotificationCategory,
} from '../../../shared/enums/notification-center.enum';
import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';

export const textButtonConfig: ButtonConfig = {
  label: '',
  matIcon: 'notifications',
  iconFontSet: 'material-icons-outlined',
  imagePosition: 'left',
  variant: 'secondary',
};

export const signInButtonConfig: ButtonConfig = {
  label: 'Sign In',
};

export const getStartedButtonConfig: ButtonConfig = {
  label: 'Get Started',
  variant: 'gradient',
};

export const markAsReadButtonConfig: ButtonConfig = {
  label: '',
  matIcon: 'check',
  iconFontSet: 'material-icons-outlined',
  imagePosition: 'left',
  variant: 'secondary',
};

export const deleteButtonConfig: ButtonConfig = {
  label: '',
  matIcon: 'delete',
  iconFontSet: 'material-icons',
  imagePosition: 'left',
  variant: 'secondary',
};

export const viewDetailsButtonConfig: ButtonConfig = {
  label: 'View Details',
  variant: 'primary',
};

export const markAsAllReadButtonConfig: ButtonConfig = {
  label: 'Mark All Read',
  matIcon: 'done_all',
  iconFontSet: 'material-icons-outlined',
  imagePosition: 'left',
  variant: 'secondary',
};

export const viewAllDetailsButtonConfig: ButtonConfig = {
  label: 'View All',
  matIcon: 'visibility',
  iconFontSet: 'material-icons-outlined',
  imagePosition: 'left',
  variant: 'secondary',
};

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
};

export const logOutButtonConfig: ButtonConfig = {
  label: 'Log Out',
  variant: 'secondary',
};

export const logOutUserDialog: ConfirmationDialogData = {
  title: 'Log Out Confimation',
  message: 'Are you sure you want to log-out this session?',
  confirmButtonConfig: logOutButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export interface NotificationRoute {
  path: string;
  queryParams?: Record<string, string | number | boolean | null | undefined>;
}

export function getNotificationRoute(isAdmin: boolean, category: number): NotificationRoute {
  const adminRoutes: Record<number, string> = {
    [AdminNotificationCategory.BattleManagement]: Navigations.BattlesAdmin,
    [AdminNotificationCategory.ContentModeration]: Navigations.ContentModeration,
    [AdminNotificationCategory.FinancialManagement]: Navigations.Finance,
    [AdminNotificationCategory.QuizManagment]: Navigations.Quizzes,
    [AdminNotificationCategory.SystemManagement]: Navigations.Settings,
    [AdminNotificationCategory.TournamentManagement]: Navigations.TournamentsAdmin,
    [AdminNotificationCategory.UserManagement]: Navigations.Users,
  };

  const userRoutes: Record<number, string> = {
    [UserNotificationCategory.BadgesAndAchievements]: Navigations.Profile,
    [UserNotificationCategory.Battles]: Navigations.Battles,
    [UserNotificationCategory.BrowseQuizes]: `${Navigations.QuizList}/${Navigations.BrowseQuizzes}`,
    [UserNotificationCategory.FinancialManagement]: Navigations.Finance,
    [UserNotificationCategory.Tournaments]: Navigations.Tournaments,
  };
  const path = isAdmin
    ? `/${Navigations.Admin}/${adminRoutes[category] ?? Navigations.Dashboard}`
    : `/${Navigations.User}/${userRoutes[category] ?? Navigations.Dashboard}`;

  let queryParams;
  if (!isAdmin && category === UserNotificationCategory.BadgesAndAchievements) {
    queryParams = { tab: 1 };
  }

  return { path, queryParams };
}
