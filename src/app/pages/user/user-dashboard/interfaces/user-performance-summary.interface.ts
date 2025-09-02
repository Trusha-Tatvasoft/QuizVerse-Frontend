import { CardColor } from '../../../../utils/types/card-component.type';
import { WelcomeBanner } from './welcome-banner.interface';

export interface UserPerformanceSummary {
  quizzesCompleted: number;
  totalXp: number;
  winRate: number;
  currentRank: number;
}

export interface UserPerformanceCardDetails {
  title: string;
  icon: string;
  iconColor: CardColor;
}

export interface UserDashboardData {
  banner: WelcomeBanner;
  card: UserPerformanceSummary;
}
