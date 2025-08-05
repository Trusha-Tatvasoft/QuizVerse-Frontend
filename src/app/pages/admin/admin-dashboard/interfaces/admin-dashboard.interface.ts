import { ChartData } from 'chart.js';
import { CardColor } from '../../../../utils/types/card-component.type';

type ChartType = 'line' | 'bar' | 'doughnut';

export interface InsightCardWithChart {
  icon: string;
  title: string;
  subtitle: string;
  type: 'engagement' | 'performance' | 'revenue';
  chart?: {
    type?: ChartType;
    data?: ChartData;
    options?: any;
  };
}

export interface InsightCards {
  icon: string;
  title: string;
  subtitle: string;
  type: 'engagement' | 'performance' | 'revenue';
}

export interface DashboardStat {
  value: number;
  trendPercentage: number;
}

export interface AdminDashboardData {
  totalUsers: DashboardStat;
  activeQuizzes: DashboardStat;
  revenue: DashboardStat;
  reports: DashboardStat;
}

export interface DashboardCardDetails {
  title: string;
  icon: string;
  iconColor: CardColor;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DateRangeQuery {
  start_date: string;
  end_date: string;
}
