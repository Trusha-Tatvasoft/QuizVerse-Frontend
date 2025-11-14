import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { ContentModerationSummary } from './interfaces/content-moderation-summary.interface';

export function mapContentModerationSummaryToCards(
  data: ContentModerationSummary,
): CardInputConfig[] {
  return [
    {
      title: 'Pending Reports',
      subtitle: 'Requires attention',
      value: data.pendingReportsCount.toLocaleString(),
      icon: 'flag',
      iconColor: 'red',
      subtitleColor: 'red',
      valueColor: 'red',
    },
    {
      title: 'Under Review',
      subtitle: 'Being processed',
      value: data.underReviewReportsCount.toLocaleString(),
      icon: 'visibility',
      iconColor: 'orange',
      subtitleColor: 'orange',
      valueColor: 'orange',
    },
    {
      title: 'Resolved Today',
      subtitle: 'Actions taken',
      value: data.todayResolvedReportsCount.toLocaleString(),
      icon: 'check_circle',
      iconColor: 'green',
      subtitleColor: 'green',
      valueColor: 'green',
    },
    {
      title: 'Banned Users',
      subtitle: 'This month',
      value: data.bannedUserCount.toLocaleString(),
      icon: 'block',
      iconColor: 'purple',
      subtitleColor: 'purple',
      valueColor: 'purple',
    },
  ];
}
