import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LazyTab } from '../../../../shared/interfaces/tab-component.interface';
import { tabLazyComponentMap } from '../../../../utils/tab-component-lazy-map';
import { ContentModerationCardDetails } from '../interfaces/content-moderation-card-details.interface';
import { ContentModerationSummary } from '../interfaces/content-moderation-summary.interface';

// Header section config for Content Moderation Stats
export const contentModerationCardConfig: Record<
  keyof ContentModerationSummary,
  ContentModerationCardDetails
> = {
  pendingReports: {
    title: 'Pending Reports',
    subtitle: 'Requires attention',
    icon: 'flag',
    iconColor: 'red',
  },
  underReview: {
    title: 'Under Review',
    subtitle: 'Being processed',
    icon: 'visibility',
    iconColor: 'orange',
  },
  resolvedToday: {
    title: 'Resolved Today',
    subtitle: 'Actions taken',
    icon: 'check_circle',
    iconColor: 'green',
  },
  bannedUsers: {
    title: 'Banned Users',
    subtitle: 'This month',
    icon: 'block',
    iconColor: 'purple',
  },
};

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
    icon: 'flag',
    loadChildren: tabLazyComponentMap['reportedQuizzes'],
  },
  {
    id: 'flaggedComments',
    label: 'Flagged Comments',
    icon: 'chat',
    loadChildren: tabLazyComponentMap['flaggedComments'],
  },
];
