import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationCenterComponent } from './notification-center.component';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Role } from '../../../shared/enums/role';

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
      (mockAuth.getRoleFromToken as jest.Mock).mockReturnValue(Role.Admin);

      component.ngOnInit();

      expect(component.isAdmin).toBe(true);
    });

    it('should set isAdmin = false if no token', () => {
      (mockAuth.getAccessToken as jest.Mock).mockReturnValue(null);

      component.ngOnInit();

      expect(component.isAdmin).toBe(false);
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
});
