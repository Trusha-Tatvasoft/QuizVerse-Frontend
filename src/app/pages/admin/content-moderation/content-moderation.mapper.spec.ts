import { ContentModerationSummary } from './interfaces/content-moderation-summary.interface';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { mapContentModerationSummaryToCards } from './content-moderation.mapper';

describe('mapContentModerationSummaryToCards', () => {
  const mockSummary: ContentModerationSummary = {
    pendingReportsCount: 5,
    underReviewReportsCount: 2,
    todayResolvedReportsCount: 10,
    bannedUserCount: 1,
  };

  it('should return an array of 4 card configurations', () => {
    const result = mapContentModerationSummaryToCards(mockSummary);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(4);
  });

  it('should correctly map "Pending Reports" card', () => {
    const [pendingCard] = mapContentModerationSummaryToCards(mockSummary);

    expect(pendingCard).toEqual<CardInputConfig>({
      title: 'Pending Reports',
      subtitle: 'Requires attention',
      value: mockSummary.pendingReportsCount.toLocaleString(),
      icon: 'flag',
      iconColor: 'red',
      subtitleColor: 'red',
      valueColor: 'red',
    });
  });

  it('should correctly map "Under Review" card', () => {
    const [, underReviewCard] = mapContentModerationSummaryToCards(mockSummary);

    expect(underReviewCard).toMatchObject({
      title: 'Under Review',
      value: mockSummary.underReviewReportsCount.toLocaleString(),
      icon: 'visibility',
      iconColor: 'orange',
    });
  });

  it('should correctly map "Resolved Today" card', () => {
    const [, , resolvedCard] = mapContentModerationSummaryToCards(mockSummary);

    expect(resolvedCard).toMatchObject({
      title: 'Resolved Today',
      subtitle: 'Actions taken',
      value: mockSummary.todayResolvedReportsCount.toLocaleString(),
      icon: 'check_circle',
      iconColor: 'green',
    });
  });

  it('should correctly map "Banned Users" card', () => {
    const result = mapContentModerationSummaryToCards(mockSummary);
    const bannedCard = result[3];

    expect(bannedCard.title).toBe('Banned Users');
    expect(bannedCard.value).toBe(mockSummary.bannedUserCount.toLocaleString());
    expect(bannedCard.icon).toBe('block');
    expect(bannedCard.iconColor).toBe('purple');
  });
});
