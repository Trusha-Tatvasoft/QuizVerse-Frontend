import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { SidebarItem } from '../../../shared/interfaces/sidebar-component.interface';

const dummyComponent = class {};

const userSidebarItems: SidebarItem[] = [
  { label: 'User Dashboard', icon: 'dashboard', route: '/user/dashboard' },
  { label: 'My Quizzes', icon: 'assignment', route: '/user/my-quizzes' },
  { label: 'Attempt Quiz', icon: 'play_circle_filled', route: '/user/attempt' },
  { label: 'Quiz History', icon: 'history', route: '/user/history' },
  { label: 'Leaderboard', icon: 'emoji_events', route: '/user/leaderboard' },
  { label: 'Profile', icon: 'person', route: '/user/profile' },
  { label: 'Settings', icon: 'settings', route: '/user/settings' },
  { label: 'Support', icon: 'support_agent', route: '/user/support' },
];

const adminSidebarItems: SidebarItem[] = [
  { label: 'Admin Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
  { label: 'User Management', icon: 'group', route: '/admin/users' },
  { label: 'Quiz Management', icon: 'quiz', route: '/admin/quizzes' },
  { label: 'Quiz Categories', icon: 'category', route: '/admin/quiz-categories' },
  { label: 'Difficulty Levels', icon: 'signal_cellular_alt', route: '/admin/difficulty-levels' },
  { label: 'Battle Management', icon: 'sports_kabaddi', route: '/admin/battles' },
  { label: 'Question Pool', icon: 'inventory_2', route: '/admin/questions' },
  { label: 'Question Difficulty', icon: 'bar_chart', route: '/admin/question-difficulty' },
  { label: 'Email Templates', icon: 'email', route: '/admin/email-templates' },
  { label: 'Platform Settings', icon: 'settings', route: '/admin/platform-settings' },
  { label: 'AI Configuration', icon: 'smart_toy', route: '/admin/ai-config' },
  { label: 'Financial Management', icon: 'attach_money', route: '/admin/financial' },
  { label: 'Content Moderation', icon: 'gavel', route: '/admin/moderation' },
];

export default {
  title: 'Components/Sidebar',
  component: SidebarComponent,
  tags: ['autodocs'],
} as Meta<SidebarComponent>;

type Story = StoryObj<SidebarComponent>;
export const UserRole: Story = {
  name: 'User Role',
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([
          { path: 'user/dashboard', component: dummyComponent },
          { path: 'user/my-quizzes', component: dummyComponent },
          { path: 'user/attempt', component: dummyComponent },
          { path: 'user/history', component: dummyComponent },
          { path: 'user/leaderboard', component: dummyComponent },
          { path: 'user/profile', component: dummyComponent },
          { path: 'user/settings', component: dummyComponent },
          { path: 'user/support', component: dummyComponent },
        ]),
      ],
    }),
  ],
  args: {
    sidebarItems: userSidebarItems,
    role: 'user',
  },
};

export const AdminRole: Story = {
  name: 'Admin Role',
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([
          { path: 'admin/dashboard', component: dummyComponent },
          { path: 'admin/users', component: dummyComponent },
          { path: 'admin/quizzes', component: dummyComponent },
          { path: 'admin/quiz-categories', component: dummyComponent },
          { path: 'admin/difficulty-levels', component: dummyComponent },
          { path: 'admin/battles', component: dummyComponent },
          { path: 'admin/questions', component: dummyComponent },
          { path: 'admin/question-difficulty', component: dummyComponent },
          { path: 'admin/email-templates', component: dummyComponent },
          { path: 'admin/platform-settings', component: dummyComponent },
          { path: 'admin/ai-config', component: dummyComponent },
          { path: 'admin/financial', component: dummyComponent },
          { path: 'admin/moderation', component: dummyComponent },
        ]),
      ],
    }),
  ],
  args: {
    sidebarItems: adminSidebarItems,
    role: 'admin',
  },
};
