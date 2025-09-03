import {
  UserPerformanceCardDetails,
  UserPerformanceSummary,
} from '../interfaces/user-performance-summary.interface';

export const userPerformanceCardConfig: Record<
  keyof UserPerformanceSummary,
  UserPerformanceCardDetails
> = {
  quizzesCompleted: {
    title: 'Quizzes Completed',
    icon: 'menu_book',
    iconColor: 'blue',
  },
  totalXp: {
    title: 'Total XP',
    icon: 'star_outline',
    iconColor: 'yellow',
  },
  winRate: {
    title: 'Win Rate',
    icon: 'my_location',
    iconColor: 'green',
  },
  currentRank: {
    title: 'Current Rank',
    icon: 'emoji_events',
    iconColor: 'purple',
  },
};
