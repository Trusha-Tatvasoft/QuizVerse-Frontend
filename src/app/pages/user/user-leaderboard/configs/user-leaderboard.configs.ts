import { GlobalRankingsComponent } from '../global-rankings/global-rankings.component';
import { LeaderboardTab, UserLeaderboardStats } from '../interfaces/user-leaderboard.interface';

export const defaultUserLeaderboardStats: UserLeaderboardStats = {
  globalRank: 0,
  totalXp: 0,
  currentLevel: 0,
};

export const defaultUserLeaderboardTabs: LeaderboardTab[] = [
  {
    id: 'global',
    label: 'Global Rankings',
    icon: 'public',
    loadChildren: async () => GlobalRankingsComponent,
  },
  {
    id: 'weekly',
    label: 'Weekly Leaders',
    icon: 'calendar_today',
    loadChildren: async () => GlobalRankingsComponent,
  },
  {
    id: 'category',
    label: 'By Category',
    icon: 'category',
    loadChildren: async () => GlobalRankingsComponent,
  },
  {
    id: 'monthly',
    label: 'Monthly Champions',
    icon: 'emoji_events',
    loadChildren: async () => GlobalRankingsComponent,
  },
];
