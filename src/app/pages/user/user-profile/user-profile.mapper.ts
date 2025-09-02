import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { environment } from '../../../../environments/environment.dev';
import { UserBasicProfile, UserOverview } from './interfaces/user-profile.interface';
import { TagInputConfig } from '../../../shared/interfaces/tag-component.interface';
import { BadgeType } from '../../../shared/enums/user-profile.enum';
import { UserBadges } from './interfaces/user-badges.interface';

/** Map profile picture URL */
export function mapProfilePic(profilePic: string | null): string {
  return profilePic ? `${environment.imageBaseUrl}/${profilePic}` : 'assets/images/profile.png';
}

/** Generic mapper for cards config - user profile */
export function mapCards(
  items: { title: string; value: string | number; icon: string }[],
): CardInputConfig[] {
  return items.map((item) => ({
    title: item.title,
    value: item.value,
    icon: item.icon,
    subtitle: '',
    subtitleColor: 'gray',
    valueColor: 'black',
    iconColor: 'purple',
  }));
}

/** Map user profile to profile cards */
export function mapUserProfileCards(user: UserBasicProfile): CardInputConfig[] {
  return mapCards([
    { title: 'Quizzes Completed', value: user.quizCompleted, icon: 'schedule' },
    { title: 'Total XP', value: user.totalXp, icon: 'star' },
    { title: 'Win Rate', value: `${user.winRate}%`, icon: 'emoji_events' },
    { title: 'Achievements', value: user.achievements, icon: 'military_tech' },
  ]);
}

/** Map recent activity */
export function mapRecentActivities(overview: UserOverview): { text: string; xp: number }[] {
  return (
    overview.recentActivity?.map((act) => ({
      text: act.description,
      xp: act.xp,
    })) || []
  );
}

/** Map stats for user overview */
export function mapStats(overview: UserOverview): { label: string; value: string | number }[] {
  return [
    { label: 'Global Rank', value: overview.globalRank },
    { label: 'Best Category', value: overview.bestCategory },
    { label: 'Longest Streak', value: `${overview.longestStreak} days` },
  ];
}

/** Get tag config for user badge */
export function getBadgeTagConfig(badge: UserBadges): TagInputConfig {
  if (badge.earned) {
    return {
      id: `earned-${badge.badgeType}`,
      label: 'Earned',
      type: 'static',
      isSelected: true,
      hasBorder: true,
      backgroundColor: 'purple',
      textColor: 'lightPurple',
    };
  }

  return {
    id: `not-earned-${badge.badgeType}`,
    label: BadgeType[badge.badgeType],
    type: 'static',
    isSelected: false,
    hasBorder: false,
    backgroundColor: 'lightWhite',
    textColor: 'black',
  };
}

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
