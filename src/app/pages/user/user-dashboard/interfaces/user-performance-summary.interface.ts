import { CardColor } from '../../../../utils/types/card-component.type';
import { WelcomeBanner } from './welcome-banner.interface';

export interface UserPerformanceSummary {
  quizzesCompleted: number; // e.g. 47
  totalXp: number; // e.g. 2450
  winRate: number; // e.g. 78
  currentRank: number; // e.g. 142
}

export interface UserPerformanceCardDetails {
  title: string;
  icon: string;
  iconColor: CardColor;
}

export interface UserDashboard {
  banner: WelcomeBanner;
  card: UserPerformanceSummary;
}
