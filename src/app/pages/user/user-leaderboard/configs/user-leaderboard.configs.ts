import { LazyTab } from '../../../../shared/interfaces/tab-component.interface';
import { UserLeaderboardStats } from '../interfaces/user-leaderboard.interface';
import { tabLazyComponentMap } from '../../../../utils/tab-component-lazy-map';

export const defaultUserLeaderboardStats: UserLeaderboardStats = {
  globalRank: 0,
  totalXp: 0,
  currentLevel: 0,
};

export const defaultUserLeaderboardTabs: LazyTab[] = [
  {
    id: 'global',
    label: 'Global Rankings',
    icon: 'public',
    loadChildren: tabLazyComponentMap['global'],
  },
  {
    id: 'weekly',
    label: 'Weekly Leaders',
    icon: 'calendar_today',
    loadChildren: tabLazyComponentMap['weekly'],
  },
  {
    id: 'category',
    label: 'By Category',
    icon: 'category',
    loadChildren: tabLazyComponentMap['category'],
  },
  {
    id: 'monthly',
    label: 'Monthly Champions',
    icon: 'emoji_events',
    loadChildren: tabLazyComponentMap['monthly'],
  },
];
