import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NavbarComponent } from './navbar.component';
import { blue, yellow } from '../../../utils/constants';
import { AuthService } from '../../../core/auth/services/auth.service';
import { PlatformSettingsService } from '../../../services/admin/platform-settings/platform-settings.service';
import { NavbarDataService } from '../../../services/common/navbar/navbar-data.service';
import { UserProfileService } from '../../../services/user/user-profile/user-profile.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { of } from 'rxjs';

class MockAuthService {
  logout() {
    console.log('MockAuthService.logout() called');
  }
}

class MockPlatformSettingsService {
  platformConfig$ = of({ logo: 'assets/images/mock-logo.png' });
}

class MockNavbarDataService {
  getNavbarData() {
    return of({
      result: true,
      data: {
        currentUserXp: 500,
        progressPercentage: 75,
        notificationCount: 2,
        profilePic: null,
      },
    });
  }
}

class MockUserProfileService {
  profileUpdated$ = of(false);
}

class MockSnackbarService {
  showError(title: string, msg: string) {
    console.error('Snackbar Error:', title, msg);
  }
  showSuccess(title: string, msg: string) {
    console.log('Snackbar Success:', title, msg);
  }
}

export default {
  title: 'Layout/Navbar',
  component: NavbarComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: PlatformSettingsService, useClass: MockPlatformSettingsService },
        { provide: NavbarDataService, useClass: MockNavbarDataService },
        { provide: UserProfileService, useClass: MockUserProfileService },
        { provide: SnackbarService, useClass: MockSnackbarService },
      ],
    }),
  ],
} as Meta<NavbarComponent>;

type Story = StoryObj<NavbarComponent>;

// User Logged In (non-admin) with Notifications
export const LoggedInUserWithNotifications: Story = {
  args: {
    isLogin: true,
    isAdmin: false,
    currentXp: 500,
    progressPercentage: 78,
    notificationCount: 2,
    notifications: [
      {
        id: '1',
        title: 'New badge earned!',
        message: 'You have earned a new badge for completing a quiz.',
        timeAgo: new Date(),
        read: false,
        tagConfig: blue,
        category: 'achievement',
        categoryValue: 1,
      },
      {
        id: '2',
        title: 'Reminder',
        message: 'Don’t forget to finish your weekly challenge.',
        timeAgo: new Date(),
        read: true,
        tagConfig: yellow,
        category: 'reminder',
        categoryValue: 2,
      },
    ],
  },
};

// Admin Logged In
export const LoggedInAdmin: Story = {
  args: {
    isLogin: true,
    isAdmin: true,
    currentXp: 700,
    progressPercentage: 67,
    notificationCount: 0,
    notifications: [],
  },
};

// Guest User (Not Logged In)
export const GuestView: Story = {
  args: {
    isLogin: false,
    isAdmin: false,
    notificationCount: 0,
    notifications: [],
  },
};

// Logged In User without Notifications
export const LoggedInUserNoNotifications: Story = {
  args: {
    isLogin: true,
    isAdmin: false,
    currentXp: 250,
    progressPercentage: 65,
    notificationCount: 0,
    notifications: [],
  },
};
