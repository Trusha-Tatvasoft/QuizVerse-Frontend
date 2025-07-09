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
    theme: 'admin',
  },
};

export const UserManagement: Story = {
  args: {
    icon: 'account_circle',
    title: 'User Management',
    subtitle: 'Manage user accounts, roles, and permissions',
    theme: 'user',
  },
};

export const QuizCategories: Story = {
  args: {
    icon: 'folder_copy',
    title: 'Quiz Categories Management',
    subtitle: 'Organize quizzes by categories and subjects',
    theme: 'quiz',
  },
};

export const QuizDifficulty: Story = {
  args: {
    icon: 'workspace_premium',
    title: 'Quiz Difficulty Configuration',
    subtitle: 'Manage quiz difficulty levels and settings',
    theme: 'quizDifficulty',
  },
};

export const QuestionDifficulty: Story = {
  args: {
    icon: 'psychology_alt',
    title: 'Question Difficulty Management',
    subtitle: 'Configure difficulty levels for questions with XP rewards',
    theme: 'queDifficulty',
  },
};

export const EmailTemplates: Story = {
  args: {
    icon: 'mail',
    title: 'Email Template Management',
    subtitle: 'Configure email templates for various platform notifications',
    theme: 'email',
  },
};

export const PlatformSettings: Story = {
  args: {
    icon: 'settings',
    title: 'Platform Configuration',
    subtitle: 'Configure general platform settings and payment options',
    theme: 'email',
  },
};

export const AIConfig: Story = {
  args: {
    icon: 'bolt',
    title: 'AI & Machine Learning Configuration',
    subtitle: 'Configure AI-powered features for quiz generation and explanations',
    theme: 'quizDifficulty',
  },
};

export const FinancialOverview: Story = {
  args: {
    icon: 'event_note',
    title: 'Financial Overview & Management',
    subtitle: 'Track revenue, manage transactions, and monitor financial performance',
    theme: 'financial',
  },
};

export const Moderation: Story = {
  args: {
    icon: 'warning',
    title: 'Content Moderation Center',
    subtitle: 'Review and moderate reported content, users, and comments',
    theme: 'admin',
  },
};
