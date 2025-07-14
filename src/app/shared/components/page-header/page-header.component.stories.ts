import { Meta, StoryObj } from '@storybook/angular';
import { PageHeaderComponent } from './page-header.component';

/**
 * Storybook configuration for PageHeaderComponent.
 * This file defines various visual states for different themes using mock data.
 */

export default {
  title: 'Components/PageHeader',
  component: PageHeaderComponent,
  tags: ['autodocs'],
} satisfies Meta<PageHeaderComponent>;

type Story = StoryObj<PageHeaderComponent>;

// Admin header example
export const Admin: Story = {
  args: {
    icon: 'shield',
    title: 'Administrator Control Panel',
    subtitle: 'Comprehensive analytics and platform performance metrics',
    theme: 'admin',
  },
};

// User Management header
export const UserManagement: Story = {
  args: {
    icon: 'account_circle',
    title: 'User Management',
    subtitle: 'Manage user accounts, roles, and permissions',
    theme: 'user',
  },
};

// Quiz Categories header
export const QuizCategories: Story = {
  args: {
    icon: 'folder_copy',
    title: 'Quiz Categories Management',
    subtitle: 'Organize quizzes by categories and subjects',
    theme: 'quiz',
  },
};

// Quiz Difficulty header
export const QuizDifficulty: Story = {
  args: {
    icon: 'workspace_premium',
    title: 'Quiz Difficulty Configuration',
    subtitle: 'Manage quiz difficulty levels and settings',
    theme: 'quizDifficulty',
  },
};

// Question Difficulty header
export const QuestionDifficulty: Story = {
  args: {
    icon: 'psychology_alt',
    title: 'Question Difficulty Management',
    subtitle: 'Configure difficulty levels for questions with XP rewards',
    theme: 'queDifficulty',
  },
};

// Email Templates header
export const EmailTemplates: Story = {
  args: {
    icon: 'mail',
    title: 'Email Template Management',
    subtitle: 'Configure email templates for various platform notifications',
    theme: 'email',
  },
};

// Platform Settings header
export const PlatformSettings: Story = {
  args: {
    icon: 'settings',
    title: 'Platform Configuration',
    subtitle: 'Configure general platform settings and payment options',
    theme: 'email',
  },
};

// AI & Machine Learning Configuration header
export const AIConfig: Story = {
  args: {
    icon: 'bolt',
    title: 'AI & Machine Learning Configuration',
    subtitle: 'Configure AI-powered features for quiz generation and explanations',
    theme: 'quizDifficulty',
  },
};

// Financial Overview header
export const FinancialOverview: Story = {
  args: {
    icon: 'event_note',
    title: 'Financial Overview & Management',
    subtitle: 'Track revenue, manage transactions, and monitor financial performance',
    theme: 'financial',
  },
};

// Content Moderation header
export const Moderation: Story = {
  args: {
    icon: 'warning',
    title: 'Content Moderation Center',
    subtitle: 'Review and moderate reported content, users, and comments',
    theme: 'admin',
  },
};
