export enum NotificationType {
  Error = 1,
  Info = 2,
  Success = 3,
  Warning = 4,
}

export enum AdminNotificationCategory {
  BattleManagement = 1,
  ContentModeration = 2,
  FinancialManagement = 3,
  QuizManagment = 4,
  SystemManagement = 5,
  TournamentManagement = 6,
  UserManagement = 7,
}

export enum UserNotificationCategory {
  BadgesAndAchievements = 1,
  Battles = 2,
  BrowseQuizes = 3,
  FinancialManagement = 4,
  Tournaments = 5,
}

export enum NotifcationTabName {
  All = 1,
  Unread = 2,
  Read = 3,
  Urgent = 4,
}

export enum TimeFilter {
  Last1Hour = 1,
  Today = 2,
  Last7Days = 3,
  Last30Days = 4,
}
