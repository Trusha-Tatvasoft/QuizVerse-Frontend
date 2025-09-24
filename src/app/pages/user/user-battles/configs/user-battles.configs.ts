import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LazyTab } from '../../../../shared/interfaces/tab-component.interface';
import { tabLazyComponentMap } from '../../../../utils/tab-component-lazy-map';

export const userBattlesLeaderboardTabs: LazyTab[] = [
  {
    id: 'available',
    label: 'Available Battle',
    loadChildren: tabLazyComponentMap['available'],
  },
  {
    id: 'recent',
    label: 'Battles Results',
    loadChildren: tabLazyComponentMap['recent'],
  },
  {
    id: 'userBattleLeaderboard',
    label: 'Battle Leaderboard',
    loadChildren: tabLazyComponentMap['userBattleLeaderboard'],
  },
];

export const battleHeaderConfig: PageHeaderComponent = {
  icon: 'sports_martial_arts',
  title: 'Browse Battles',
  subtitle: 'Challenge others in real-time quizzes and climb the ranks',
  theme: 'email',
};
