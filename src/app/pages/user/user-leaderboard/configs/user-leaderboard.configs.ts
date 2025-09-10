import { LazyTab } from '../../../../shared/interfaces/tab-component.interface';
import { GlobalRankingsComponent } from '../global-rankings/global-rankings.component';
import { UserLeaderboardStats } from '../interfaces/user-leaderboard.interface';
import { WeeklyLeadersComponent } from '../weekly-leaders/weekly-leaders.component';
import { CategoryLeadersComponent } from '../category-leaders/category-leaders.component';

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
    loadChildren: async () => GlobalRankingsComponent,
  },
  {
    id: 'weekly',
    label: 'Weekly Leaders',
    icon: 'calendar_today',
    loadChildren: async () => WeeklyLeadersComponent,
  },
  {
    id: 'category',
    label: 'By Category',
    icon: 'category',
    loadChildren: async () => CategoryLeadersComponent,
  },
  {
    id: 'monthly',
    label: 'Monthly Champions',
    icon: 'emoji_events',
    loadChildren: async () => GlobalRankingsComponent,
  },
];
