import { LazyTab } from '../../../../shared/interfaces/tab-component.interface';
import { tabLazyComponentMap } from '../../../../utils/tab-component-lazy-map';

export const playerProfileTabConfig: LazyTab[] = [
  {
    id: 'profile-overview',
    label: 'Overview',
    loadChildren: tabLazyComponentMap['profile-overview'],
  },
  {
    id: 'achievements',
    label: 'Achievements',
    loadChildren: tabLazyComponentMap['achievements'],
  },
  {
    id: 'settings',
    label: 'Settings',
    loadChildren: tabLazyComponentMap['settings'],
  },
];
