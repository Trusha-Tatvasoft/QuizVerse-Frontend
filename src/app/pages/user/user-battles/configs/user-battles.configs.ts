import { LazyTab } from '../../../../shared/interfaces/tab-component.interface';
import { tabLazyComponentMap } from '../../../../utils/tab-component-lazy-map';

export const UserBattlesLeaderboardTabs: LazyTab[] = [
  {
    id: 'available',
    label: 'Available Battle',
    loadChildren: tabLazyComponentMap['available'],
  },
  {
    id: 'recent',
    label: 'Recent Battles',
    loadChildren: tabLazyComponentMap['recent'],
  },
  {
    id: 'userBattleLeaderboard',
    label: 'Battle Leaderboard',
    loadChildren: tabLazyComponentMap['userBattleLeaderboard'],
  },
];
