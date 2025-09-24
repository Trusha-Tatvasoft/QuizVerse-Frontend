export interface NotificationCenterResponse {
  id: number;
  notificationTitle: string;
  notificationMessage: string;
  notificationCategory: number;
  isRead: boolean;
  notificationType: number;
  createdDate: Date;
}

export interface NotificationCenterApiResponse {
  notifications: NotificationCenterResponse[];
  all: number;
  unread: number;
  read: number;
  urgent: number;
}
