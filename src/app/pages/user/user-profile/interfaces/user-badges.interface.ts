import { BadgeType } from '../../../../shared/enums/user-profile.enum';

export interface UserBadges {
  badgeId: number;
  name: string;
  description: string;
  earned: boolean;
  badgeType: BadgeType;
}
