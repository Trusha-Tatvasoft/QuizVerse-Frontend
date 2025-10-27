import { NotifcationTabName, TimeFilter } from '../../../shared/enums/notification-center.enum';
import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';
import { LazyTab } from '../../../shared/interfaces/tab-component.interface';
import { tabLazyComponentMap } from '../../../utils/tab-component-lazy-map';

//#region Header Configs
export const notificationHeaderConfig = {
  icon: 'notifications',
  title: 'Notification Center - Comming Soon!!',
  subtitle: 'Manage all your notifications and alerts',
  theme: 'user' as const,
};
//#endregion

//#region Serach Input Configs
export const searchInputConfig = {
  placeholder: 'Search notifications',
};
//#endregion

//#region Status Tag Configs
export function buildNotificationTabs(tabCounts: Record<NotifcationTabName, number>): LazyTab[] {
  return [
    {
      id: NotifcationTabName.All.toString(),
      label: `All (${tabCounts[NotifcationTabName.All] ?? 0})`,
      loadChildren: tabLazyComponentMap['notification status'],
    },
    {
      id: NotifcationTabName.Unread.toString(),
      label: `Unread (${tabCounts[NotifcationTabName.Unread] ?? 0})`,
      loadChildren: tabLazyComponentMap['notification status'],
    },
    {
      id: NotifcationTabName.Read.toString(),
      label: `Read (${tabCounts[NotifcationTabName.Read] ?? 0})`,
      loadChildren: tabLazyComponentMap['notification status'],
    },
    {
      id: NotifcationTabName.Urgent.toString(),
      label: `Urgent (${tabCounts[NotifcationTabName.Urgent] ?? 0})`,
      loadChildren: tabLazyComponentMap['notification status'],
    },
  ];
}
//#endregion

//#region Mark All Read Button Configs
export const markAsAllReadButtonConfig: ButtonConfig = {
  label: 'Mark All Read',
  matIcon: 'done_all',
  iconFontSet: 'material-icons-outlined',
  imagePosition: 'left',
  variant: 'secondary',
};
//#endregion

//#region time filter
export const timeFilters = [
  { label: 'Last 1 Hour', value: TimeFilter.Last1Hour },
  { label: 'Today', value: TimeFilter.Today },
  { label: 'Last 7 Days', value: TimeFilter.Last7Days },
  { label: 'Last 30 Days', value: TimeFilter.Last30Days },
];
//#endregion

export const loadMoreButtonConfig: ButtonConfig = {
  label: 'Load More',
  variant: 'primary',
  fontWeight: 500,
};
