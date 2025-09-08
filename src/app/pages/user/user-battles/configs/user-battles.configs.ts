import { LazyTab } from '../../../../shared/interfaces/tab-component.interface';
import { AvailableBattlesComponent } from '../available-battles/available-battles.component';
import { BattlesLeaderboardComponent } from '../battles-leaderboard/battles-leaderboard.component';
import { RecentBattlesComponent } from '../recent-battles/recent-battles.component';

export const UserBattlesLeaderboardTabs: LazyTab[] = [
  {
    id: 'global',
    label: 'Available Battle',
    loadChildren: async () => AvailableBattlesComponent,
  },
  {
    id: 'weekly',
    label: 'Recent Battles',
    loadChildren: async () => RecentBattlesComponent,
  },
  {
    id: 'category',
    label: 'Battle Leaderboard',
    loadChildren: async () => BattlesLeaderboardComponent,
  },
];
