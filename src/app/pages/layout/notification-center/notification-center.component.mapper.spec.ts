import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationCenterComponent } from './notification-center.component';
import { AuthService } from '../../../core/auth/services/auth.service';
import { colors, roles } from '../../../utils/constants';
import {
  AdminNotificationCategory,
  NotificationType,
  UserNotificationCategory,
} from '../../../shared/enums/notification-center.enum';
import {
  enumToCategoryList,
  enumValueToLabel,
  getNotificationTypeColor,
  mapNotification,
  typeList,
} from './notification-center.comonent.mapper';
import { NotificationCenterResponse } from '../interfaces/notification-center.response.interfaces';

describe('NotificationCenterComponent', () => {
  let component: NotificationCenterComponent;
  let fixture: ComponentFixture<NotificationCenterComponent>;
  let mockAuth: Partial<AuthService>;

  beforeEach(async () => {
    mockAuth = {
      getAccessToken: jest.fn(),
      getRoleFromToken: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NotificationCenterComponent],
      providers: [{ provide: AuthService, useValue: mockAuth }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set isAdmin = true if role is admin', () => {
      (mockAuth.getAccessToken as jest.Mock).mockReturnValue('token');
      (mockAuth.getRoleFromToken as jest.Mock).mockReturnValue(roles.admin);

      component.ngOnInit();

      expect(component.isAdmin).toBe(true);
    });

    it('should set isAdmin = false if no token', () => {
      (mockAuth.getAccessToken as jest.Mock).mockReturnValue(null);

      component.ngOnInit();

      expect(component.isAdmin).toBe(false);
    });
  });

  describe('NotificationCenter Mapper Functions', () => {
    it('should map notification correctly', () => {
      const mockNotification: NotificationCenterResponse = {
        id: 1,
        notificationTitle: 'Title',
        notificationMessage: 'Message',
        createdDate: new Date(),
        isRead: false,
        notificationType: NotificationType.Success,
        notificationCategory: UserNotificationCategory.BrowseQuizes,
      };

      const result = mapNotification(mockNotification, false);

      expect(result.id).toBe('1');
      expect(result.title).toBe('Title');
      expect(result.tagConfig.label).toBe('Success');
      expect(result.category).toContain('Browse Quizes');
    });

    it('should convert enum to category list', () => {
      const list = enumToCategoryList(UserNotificationCategory);
      expect(list.every((BrowseQuizes) => 'label' in BrowseQuizes && 'value' in BrowseQuizes)).toBe(
        true,
      );
    });

    it('should return proper label for enum value', () => {
      expect(
        enumValueToLabel(UserNotificationCategory, UserNotificationCategory.BrowseQuizes),
      ).toMatch(/Browse Quizes/);
    });

    it('should return correct colors for types', () => {
      expect(getNotificationTypeColor(NotificationType.Success)).toEqual(colors.green);
      expect(getNotificationTypeColor(NotificationType.Warning)).toEqual(colors.yellow);
      expect(getNotificationTypeColor(NotificationType.Info)).toEqual(colors.blue);
      expect(getNotificationTypeColor(NotificationType.Error)).toEqual(colors.red);
    });

    it('should return all type list items', () => {
      const list = typeList();
      expect(list.length).toBeGreaterThan(0);
    });
  });

  jest.useFakeTimers();

  it('should call fetchNotifications on search input change', () => {
    const spy = jest.spyOn(component, 'fetchNotifications');

    component.onSearchInputChange('test');
    jest.runAllTimers();

    expect(spy).toHaveBeenCalled();
  });

  it('should update selectedTab and call fetchNotifications on tab change', () => {
    const spy = jest.spyOn(component, 'fetchNotifications');

    component.onTabChanged(1);

    expect(component.selectedTab).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should call fetchNotifications on filter change', () => {
    const spy = jest.spyOn(component, 'fetchNotifications');

    component.onFilterChange();

    expect(spy).toHaveBeenCalled();
  });

  it('should clear filters and reset form and selections', () => {
    const spy = jest.spyOn(component, 'fetchNotifications');

    component.searchControl.setValue('some value');
    component.selectedAdminCategory = 5;
    component.selectedUserCategory = 7;
    component.selectedType = 2;
    component.selectedTime = 3;

    component.clearFilters();

    expect(component.searchControl.value).toBeNull();
    expect(component.selectedAdminCategory).toBe(0);
    expect(component.selectedUserCategory).toBe(0);
    expect(component.selectedType).toBe(0);
    expect(component.selectedTime).toBe(0);
    expect(spy).toHaveBeenCalled();
  });

  it('should build tabs from tabCounts', () => {
    component.tabCounts.set({
      All: 10,
      Unread: 5,
      Read: 3,
      Urgent: 2,
    } as any);

    const tabs = component.tabs;

    expect(tabs.length).toBeGreaterThan(0);
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  describe('NotificationCenter Mapper Functions', () => {
    it('should return correct colors for types', () => {
      expect(getNotificationTypeColor(NotificationType.Success)).toEqual(colors.green);
      expect(getNotificationTypeColor(NotificationType.Warning)).toEqual(colors.yellow);
      expect(getNotificationTypeColor(NotificationType.Info)).toEqual(colors.blue);
      expect(getNotificationTypeColor(NotificationType.Error)).toEqual(colors.red);

      expect(getNotificationTypeColor(undefined as unknown as NotificationType)).toEqual(
        colors.white,
      );
    });

    it('should return "Unknown" for enumValueToLabel if value not found', () => {
      const result = enumValueToLabel(UserNotificationCategory, 999); // 999 does not exist
      expect(result).toBe('Unknown');
    });

    it('should use AdminNotificationCategory when isAdmin = true in mapNotification', () => {
      const mockNotification: NotificationCenterResponse = {
        id: 1,
        notificationTitle: 'Admin Title',
        notificationMessage: 'Admin Message',
        createdDate: new Date(),
        isRead: false,
        notificationType: NotificationType.Success,
        notificationCategory: AdminNotificationCategory.BattleManagement,
      };

      const result = mapNotification(mockNotification, true);
      expect(result.category).toContain('Battle Management');
    });

    it('should use UserNotificationCategory when isAdmin = false in mapNotification', () => {
      const mockNotification: NotificationCenterResponse = {
        id: 2,
        notificationTitle: 'User Title',
        notificationMessage: 'User Message',
        createdDate: new Date(),
        isRead: false,
        notificationType: NotificationType.Warning,
        notificationCategory: UserNotificationCategory.BrowseQuizes,
      };

      const result = mapNotification(mockNotification, false);
      expect(result.category).toContain('Browse Quizes');
    });
  });
});
