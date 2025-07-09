import { Meta, StoryObj } from '@storybook/angular';
import { PageHeaderComponent } from './page-header.component';
import { AppColors } from '../../../utils/constants';

export default {
  title: 'Components/PageHeader',
  component: PageHeaderComponent,
  tags: ['autodocs'],
} satisfies Meta<PageHeaderComponent>;

type Story = StoryObj<PageHeaderComponent>;

export const Admin: Story = {
  args: {
    icon: 'shield',
    title: 'Administrator Control Panel',
    subtitle: 'Comprehensive analytics and platform performance metrics',
    backgroundColor: AppColors.adminBackgroundColor,
    textColor: AppColors.adminTextColor,
    borderColor: AppColors.adminBorderColor,
    subtitleColor: AppColors.adminSubtitleColor,
  },
};

export const UserManagement: Story = {
  args: {
    icon: 'account_circle',
    title: 'User Management',
    subtitle: 'Manage user accounts, roles, and permissions',
    backgroundColor: AppColors.userBackgroundColor,
    textColor: AppColors.userTextColor,
    borderColor: AppColors.userBorderColor,
    subtitleColor: AppColors.userSubtitleColor,
  },
};

export const QuizCategories: Story = {
  args: {
    icon: 'folder_copy',
    title: 'Quiz Categories Management',
    subtitle: 'Organize quizzes by categories and subjects',
    backgroundColor: AppColors.quizBackgroundColor,
    textColor: AppColors.quizTextColor,
    borderColor: AppColors.quizBorderColor,
    subtitleColor: AppColors.quizSubtitleColor,
  },
};

export const QuizDifficulty: Story = {
  args: {
    icon: 'workspace_premium',
    title: 'Quiz Difficulty Configuration',
    subtitle: 'Manage quiz difficulty levels and settings',
    backgroundColor: AppColors.quizDifficultyBackgroundColor,
    textColor: AppColors.quizDifficultyTextColor,
    borderColor: AppColors.quizDifficultyBorderColor,
    subtitleColor: AppColors.quizDifficultySubtitleColor,
  },
};

export const QuestionDifficulty: Story = {
  args: {
    icon: 'psychology_alt',
    title: 'Question Difficulty Management',
    subtitle: 'Configure difficulty levels for questions with XP rewards',
    backgroundColor: AppColors.queDifficultyBackgroundColor,
    textColor: AppColors.queDifficultyTextColor,
    borderColor: AppColors.queDifficultyBorderColor,
    subtitleColor: AppColors.queDifficultySubtitleColor,
  },
};

export const EmailTemplates: Story = {
  args: {
    icon: 'mail',
    title: 'Email Template Management',
    subtitle: 'Configure email templates for various platform notifications',
    backgroundColor: AppColors.emailBackgroundColor,
    textColor: AppColors.emailTextColor,
    borderColor: AppColors.emailBorderColor,
    subtitleColor: AppColors.emailSubtitleColor,
  },
};

export const PlatformSettings: Story = {
  args: {
    icon: 'settings',
    title: 'Platform Configuration',
    subtitle: 'Configure general platform settings and payment options',
    backgroundColor: AppColors.emailBackgroundColor,
    textColor: AppColors.emailTextColor,
    borderColor: AppColors.emailBorderColor,
    subtitleColor: AppColors.emailSubtitleColor,
  },
};

export const AIConfig: Story = {
  args: {
    icon: 'bolt',
    title: 'AI & Machine Learning Configuration',
    subtitle: 'Configure AI-powered features for quiz generation and explanations',
    backgroundColor: AppColors.quizDifficultyBackgroundColor,
    textColor: AppColors.quizDifficultyTextColor,
    borderColor: AppColors.quizDifficultyBorderColor,
    subtitleColor: AppColors.quizDifficultySubtitleColor,
  },
};

export const FinancialOverview: Story = {
  args: {
    icon: 'event_note',
    title: 'Financial Overview & Management',
    subtitle: 'Track revenue, manage transactions, and monitor financial performance',
    backgroundColor: AppColors.financialBackgroundColor,
    textColor: AppColors.financialTextColor,
    borderColor: AppColors.financialBorderColor,
    subtitleColor: AppColors.financialSubtitleColor,
  },
};

export const Moderation: Story = {
  args: {
    icon: 'warning',
    title: 'Content Moderation Center',
    subtitle: 'Review and moderate reported content, users, and comments',
    backgroundColor: AppColors.adminBackgroundColor,
    textColor: AppColors.adminTextColor,
    borderColor: AppColors.adminBorderColor,
    subtitleColor: AppColors.adminSubtitleColor,
  },
};
