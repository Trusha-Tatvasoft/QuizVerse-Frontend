import { AdminDashboardSummary } from '../interfaces/admin-dashboard-summary.interface';
import { DashboardCardDetails } from '../interfaces/dashboard-card-details.interface';

export const dashboardStatsCardConfig: Record<keyof AdminDashboardSummary, DashboardCardDetails> = {
  totalUsers: { title: 'Total Users', icon: 'group', iconColor: 'blue' },
  activeQuizzes: { title: 'Active Quizzes', icon: 'menu_book', iconColor: 'green' },
  revenue: { title: 'Revenue', icon: 'attach_money', iconColor: 'purple' },
  reports: { title: 'Reports', icon: 'report_problem', iconColor: 'red' },
};
