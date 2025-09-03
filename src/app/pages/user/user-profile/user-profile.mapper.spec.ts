import {
  mapProfilePic,
  mapCards,
  mapUserProfileCards,
  mapRecentActivities,
  mapStats,
  getBadgeTagConfig,
  xpTagConfig,
} from './user-profile.mapper';
import { environment } from '../../../../environments/environment.dev';
import { BadgeType } from '../../../shared/enums/user-profile.enum';

describe('player-profile.mapper', () => {
  describe('mapProfilePic', () => {
    it('should return default profile pic if null', () => {
      expect(mapProfilePic(null)).toBe('assets/images/profile.png');
    });

    it('should prepend environment.imageBaseUrl if profilePic is provided', () => {
      const pic = 'avatar.png';
      const expected = `${environment.imageBaseUrl}/${pic}`;
      expect(mapProfilePic(pic)).toBe(expected);
    });
  });

  describe('mapCards', () => {
    it('should map items to CardInputConfig with default colors', () => {
      const items = [{ title: 'Title1', value: 123, icon: 'icon1' }];
      const result = mapCards(items);
      expect(result[0]).toEqual({
        title: 'Title1',
        value: 123,
        icon: 'icon1',
        subtitle: '',
        subtitleColor: 'gray',
        valueColor: 'black',
        iconColor: 'purple',
      });
    });
  });

  describe('mapUserProfileCards', () => {
    it('should map UserBasicProfile into 4 cards', () => {
      const user = {
        quizCompleted: 10,
        totalXp: 200,
        winRate: 75,
        achievements: 3,
      };
      const result = mapUserProfileCards(user as any);
      expect(result.length).toBe(4);
      expect(result[0].title).toBe('Quizzes Completed');
      expect(result[1].title).toBe('Total XP');
      expect(result[2].title).toBe('Win Rate');
      expect(result[3].title).toBe('Achievements');
    });
  });

  describe('mapRecentActivities', () => {
    it('should return mapped activities if present', () => {
      const overview = {
        recentActivity: [
          { description: 'Did quiz', xp: 10 },
          { description: 'Earned badge', xp: 20 },
        ],
      };
      const result = mapRecentActivities(overview as any);
      expect(result).toEqual([
        { text: 'Did quiz', xp: 10 },
        { text: 'Earned badge', xp: 20 },
      ]);
    });

    it('should return empty array if recentActivity is missing', () => {
      const overview = {} as any;
      expect(mapRecentActivities(overview)).toEqual([]);
    });
  });

  describe('mapStats', () => {
    it('should map stats into correct labels/values', () => {
      const overview = {
        globalRank: 15,
        bestCategory: 'Science',
        longestStreak: 7,
      };
      const result = mapStats(overview as any);
      expect(result).toEqual([
        { label: 'Global Rank', value: 15 },
        { label: 'Best Category', value: 'Science' },
        { label: 'Longest Streak', value: '7 days' },
      ]);
    });
  });

  describe('getBadgeTagConfig', () => {
    it('should return Earned config when badge.earned = true', () => {
      const badge = { badgeType: BadgeType.Gold, earned: true };
      const config = getBadgeTagConfig(badge as any);
      expect(config).toEqual(
        expect.objectContaining({
          id: `earned-${BadgeType.Gold}`,
          label: 'Earned',
          isSelected: true,
          backgroundColor: 'purple',
        }),
      );
    });

    it('should return Not Earned config when badge.earned = false', () => {
      const badge = { badgeType: BadgeType.Silver, earned: false };
      const config = getBadgeTagConfig(badge as any);
      expect(config).toEqual(
        expect.objectContaining({
          id: `not-earned-${BadgeType.Silver}`,
          label: BadgeType[BadgeType.Silver],
          isSelected: false,
          backgroundColor: 'lightWhite',
        }),
      );
    });
  });
  describe('xpTagConfig', () => {
    it('should return correct TagInputConfig for given xp', () => {
      const xp = 50;
      const config = xpTagConfig(xp);

      expect(config).toEqual({
        id: 'xp',
        label: '+50 XP',
        type: 'static',
        hasBorder: false,
        backgroundColor: 'black',
        textColor: 'lightWhite',
        isSelected: false,
      });
    });

    it('should handle 0 xp correctly', () => {
      const config = xpTagConfig(0);

      expect(config.label).toBe('+0 XP');
      expect(config.id).toBe('xp');
    });
  });
});
