import { ChartConfiguration } from 'chart.js';
import {
  AdminDashboardData,
  DashboardCardDetails,
  InsightCards,
} from '../interfaces/admin-dashboard.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

export const ADMIN_DASHBOARD_HEADER_CONFIG: PageHeaderComponent = {
  icon: 'shield',
  title: 'Administrator Control Panel',
  subtitle: 'Platform performance overview',
  theme: 'admin',
};
export const DASHBOARD_STATS_CARD_CONFIG: Record<keyof AdminDashboardData, DashboardCardDetails> = {
  totalUsers: { title: 'Total Users', icon: 'group', iconColor: 'blue' },
  activeQuizzes: { title: 'Active Quizzes', icon: 'menu_book', iconColor: 'green' },
  revenue: { title: 'Revenue', icon: 'attach_money', iconColor: 'purple' },
  reports: { title: 'Reports', icon: 'report_problem', iconColor: 'red' },
};

export const LINE_CHART_OPTIONS_CONFIG: ChartConfiguration<'line'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 5,
      bottom: 5,
      left: 5,
      right: 5,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#111827',
      titleFont: {
        size: 11,
        weight: 'bold',
        family: "'Segoe UI', 'Roboto', sans-serif",
      },
      bodyFont: {
        size: 10,
        family: "'Segoe UI', 'Roboto', sans-serif",
      },
      padding: 6,
      borderColor: '#9CA3AF',
      borderWidth: 1,
      cornerRadius: 4,
    },
  },
  scales: {
    x: {
      grid: {
        color: '#E5E7EB',
      },
      ticks: {
        font: {
          size: 10,
          family: "'Segoe UI', 'Roboto', sans-serif",
        },
        color: '#374151',
        maxRotation: 45,
        minRotation: 0,
      },
    },
    y: {
      grid: {
        color: '#E5E7EB',
      },
      ticks: {
        font: {
          size: 10,
          family: "'Segoe UI', 'Roboto', sans-serif",
        },
        color: '#374151',
        maxTicksLimit: 5,
      },
    },
  },
  elements: {
    point: {
      radius: 3,
      hoverRadius: 5,
      backgroundColor: '#3b82f6',
    },
    line: {
      borderWidth: 2.5,
      tension: 0.4,
    },
  },
};

export const BAR_CHART_OPTIONS_CONFIG: ChartConfiguration<'bar'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 5,
      bottom: 5,
      left: 5,
      right: 5,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#111827',
      titleFont: {
        size: 11,
        weight: 'bold',
        family: "'Segoe UI', 'Roboto', sans-serif",
      },
      bodyFont: {
        size: 10,
        family: "'Segoe UI', 'Roboto', sans-serif",
      },
      padding: 6,
      borderColor: '#9CA3AF',
      borderWidth: 1,
      cornerRadius: 4,
    },
  },
  scales: {
    x: {
      grid: {
        color: '#E5E7EB',
      },
      ticks: {
        font: {
          size: 10,
          family: "'Segoe UI', 'Roboto', sans-serif",
        },
        color: '#374151',
        maxRotation: 45,
        minRotation: 0,
      },
      stacked: false,
    },
    y: {
      grid: {
        color: '#E5E7EB',
      },
      ticks: {
        font: {
          size: 10,
          family: "'Segoe UI', 'Roboto', sans-serif",
        },
        color: '#374151',
        maxTicksLimit: 5,
      },
      stacked: false,
    },
  },
  elements: {
    bar: {
      borderWidth: 2,
      borderSkipped: 'bottom',
    },
  },
};

export const DOUGHNUT_CHART_OPTIONS_CONFIG: ChartConfiguration<'doughnut'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 5,
      bottom: 5,
      left: 5,
      right: 5,
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 10,
        color: '#6b21a8',
        font: {
          size: 9,
          weight: 'bold',
          family: "'Segoe UI', 'Roboto', sans-serif",
        },
        boxWidth: 8,
        boxHeight: 8,
      },
    },
    tooltip: {
      backgroundColor: '#111827',
      titleFont: {
        size: 11,
        weight: 'bold',
        family: "'Segoe UI', 'Roboto', sans-serif",
      },
      bodyFont: {
        size: 10,
        family: "'Segoe UI', 'Roboto', sans-serif",
      },
      padding: 6,
      borderColor: '#9CA3AF',
      borderWidth: 1,
      cornerRadius: 4,
    },
  },
};

export const INSIGHT_CARDS_CONFIG: InsightCards[] = [
  {
    icon: 'trending_up',
    title: 'User Engagement',
    subtitle: 'Monthly engagement trend',
    type: 'engagement',
  },
  {
    icon: 'insights',
    title: 'Performance Score',
    subtitle: 'Weekly improvement',
    type: 'performance',
  },
  {
    icon: 'attach_money',
    title: 'Revenue Trends',
    subtitle: 'Quarterly overview',
    type: 'revenue',
  },
];
