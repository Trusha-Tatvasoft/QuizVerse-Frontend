import { LazyTab } from '../../../../shared/interfaces/tab-component.interface';
import { tabLazyComponentMap } from '../../../../utils/tab-component-lazy-map';

export const quizTabConfig: LazyTab[] = [
  {
    id: 'featured',
    label: 'Featured',
    loadChildren: tabLazyComponentMap['featured'],
  },
  {
    id: 'all-quizzes',
    label: 'All Quizzes',
    loadChildren: tabLazyComponentMap['all quizzes'],
  },
  {
    id: 'free',
    label: 'Free Only',
    loadChildren: tabLazyComponentMap['free'],
  },
  {
    id: 'premium',
    label: 'Premium',
    loadChildren: tabLazyComponentMap['premium'],
  },
];
