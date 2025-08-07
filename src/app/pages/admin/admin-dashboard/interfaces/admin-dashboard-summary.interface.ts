export interface DashboardMetric {
  value: number;
  trendPercentage: number;
}

export interface AdminDashboardSummary {
  totalUsers: DashboardMetric;
  activeQuizzes: DashboardMetric;
  revenue: DashboardMetric;
  reports: DashboardMetric;
}
