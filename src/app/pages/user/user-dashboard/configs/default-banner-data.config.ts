import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { WelcomeBanner } from '../interfaces/welcome-banner.interface';

export const defaultBannerData: WelcomeBanner = {
  userName: '',
  currentRank: 0,
};

export const userDashboardHeaderConfig: PageHeaderComponent = {
  icon: 'shield',
  title: 'Dashboard',
  subtitle: 'Track your progress across quizzes, battles, and achievements',
  theme: 'quizDifficulty',
};
