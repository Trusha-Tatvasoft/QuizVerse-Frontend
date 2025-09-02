import { LazyTab } from '../../../../shared/interfaces/tab-component.interface';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';

export const playerProfileTabConfig: LazyTab[] = [
  {
    id: 'profile-overview',
    label: 'Overview',
    loadChildren: () =>
      import('../components/user-overview/user-overview.component').then(
        (m) => m.UserOverviewComponent,
      ),
  },
  {
    id: 'achievements',
    label: 'Achievements',
    loadChildren: () =>
      import('../components/user-achievement/user-achievement.component').then(
        (m) => m.UserAchievementComponent,
      ),
  },
  {
    id: 'settings',
    label: 'Settings',
    loadChildren: () =>
      import('../components/user-profile-setting/user-profile-setting.component').then(
        (m) => m.UserProfileSettingComponent,
      ),
  },
];

// xp config for recent activity xp tags
export const xpTagConfig = (xp: number): TagInputConfig => ({
  id: 'xp',
  label: `+${xp} XP`,
  type: 'static',
  hasBorder: false,
  backgroundColor: 'black',
  textColor: 'lightWhite',
  isSelected: false,
});
