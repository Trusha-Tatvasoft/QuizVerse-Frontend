import { Meta, StoryObj } from '@storybook/angular';
import { NavbarComponent } from './navbar.component';
import { blue, yellow } from '../../../utils/constants';

// ✅ Standalone components don't need moduleMetadata unless using non-standalone children
export default {
  title: 'Shared/Navbar',
  component: NavbarComponent,
  tags: ['autodocs'],
} as Meta<NavbarComponent>;

type Story = StoryObj<NavbarComponent>;

// 🧑‍💻 1. User Logged In (non-admin) with Notifications
export const LoggedInUserWithNotifications: Story = {
  args: {
    isLogin: true,
    isAdmin: false,
    currentXp: 500,
    xpLimit: 1000,
    notificationCount: 3,
    notifications: [
      {
        id: '1',
        title: 'New badge earned!',
        message: 'You have earned a new badge for completing a quiz.',
        timeAgo: '2m ago',
        read: false,
        type: 'info',
        tagConfig: blue,
      },
      {
        id: '2',
        title: 'Reminder',
        message: 'Don’t forget to finish your weekly challenge.',
        timeAgo: '1h ago',
        read: true,
        type: 'warning',
        tagConfig: yellow,
      },
    ],
  },
};

// 👮‍♂️ 2. Admin Logged In
export const LoggedInAdmin: Story = {
  args: {
    isLogin: true,
    isAdmin: true,
    currentXp: 700,
    xpLimit: 1000,
    notificationCount: 2,
    notifications: [],
  },
};

// 🙅‍♂️ 3. Guest User (Not Logged In)
export const GuestView: Story = {
  args: {
    isLogin: false,
    isAdmin: false,
    notificationCount: 0,
    notifications: [],
  },
};

// 📭 4. Logged In User without Notifications
export const LoggedInUserNoNotifications: Story = {
  args: {
    isLogin: true,
    isAdmin: false,
    currentXp: 250,
    xpLimit: 1000,
    notificationCount: 0,
    notifications: [],
  },
};
