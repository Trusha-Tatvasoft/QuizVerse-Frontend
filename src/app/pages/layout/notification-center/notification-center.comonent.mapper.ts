import {
  AdminNotificationCategory,
  NotificationType,
  UserNotificationCategory,
} from '../../../shared/enums/notification-center.enum';
import { colors, regexPatterns } from '../../../utils/constants';
import { TagColor } from '../../../utils/types/tag-component.type';
import { Notifications } from '../interfaces/navbar.component.interface';
import { NotificationCenterResponse } from '../interfaces/notification-center.response.interfaces';

export function typeList() {
  return Object.keys(NotificationType)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      label: key,
      value: NotificationType[key as keyof typeof NotificationType],
    }));
}

export function enumToCategoryList<T extends object>(enumObj: T) {
  return Object.keys(enumObj)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      label: key.replace(regexPatterns.CAMEL_CASE_REGEX, '$1 $2'),
      value: enumObj[key as keyof typeof enumObj],
    }));
}

export function enumValueToLabel<T extends object>(enumObj: T, value: number | string): string {
  const key = Object.keys(enumObj).find((k) => enumObj[k as keyof typeof enumObj] === value);
  return key ? key.replace(regexPatterns.CAMEL_CASE_REGEX, '$1 $2') : 'Unknown';
}

// main mapper
export function mapNotification(
  notification: NotificationCenterResponse,
  isAdmin: boolean,
): Notifications {
  const color = getNotificationTypeColor(notification.notificationType);

  const categoryEnum = isAdmin ? AdminNotificationCategory : UserNotificationCategory;

  return {
    id: String(notification.id),
    title: notification.notificationTitle,
    message: notification.notificationMessage,
    timeAgo: new Date(notification.createdDate),
    read: notification.isRead,
    tagConfig: {
      id: notification.id.toString(),
      label: NotificationType[notification.notificationType],
      backgroundColor: color.bg as TagColor,
      textColor: color.text as TagColor,
      isSelected: false,
      hasBorder: true,
      type: 'static',
    },
    category: enumValueToLabel(categoryEnum, notification.notificationCategory),
    categoryValue: notification.notificationCategory,
  };
}

export function getNotificationTypeColor(type: NotificationType): { bg: string; text: string } {
  switch (type) {
    case NotificationType.Success:
      return colors.green;
    case NotificationType.Warning:
      return colors.yellow;
    case NotificationType.Info:
      return colors.blue;
    case NotificationType.Error:
      return colors.red;
    default:
      return colors.white;
  }
}
