import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LazyTab } from '../../../../shared/interfaces/tab-component.interface';
import { tabLazyComponentMap } from '../../../../utils/tab-component-lazy-map';

// Header section config for Content Moderation page
export const contentModerationHeaderConfig: PageHeaderComponent = {
  icon: 'warning',
  title: 'Content Moderation',
  subtitle: 'Review and moderate reported content, users, and comments',
  theme: 'admin',
};

// Tab configuration for Content Moderation page
export const defaultContentModerationTabs: LazyTab[] = [
  {
    id: 'reportedQuizzes',
    label: 'Reported Quizzes',
    loadChildren: tabLazyComponentMap['reportedQuizzes'],
  },
  {
    id: 'flaggedComments',
    label: 'Flagged Comments',
    loadChildren: tabLazyComponentMap['flaggedComments'],
  },
  {
    id: 'reportedQuestions',
    label: 'Reported Questions',
    loadChildren: tabLazyComponentMap['reportedQuestions'],
  },
];
