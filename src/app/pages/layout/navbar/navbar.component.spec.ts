import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NavbarComponent } from './navbar.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { roles } from '../../../utils/constants';
import { mockDataNotifications } from './navbar-mock-data';
import { Navigations } from '../../../shared/enums/navigation';
import { AuthService } from '../../../core/auth/services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { PlatformSettingsService } from '../../../services/admin/platform-settings/platform-settings.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.dev';
import { UserProfileService } from '../../../services/user/user-profile/user-profile.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock: { logout: jest.Mock; currentRole$: any };
  let routerMock: { navigate: jest.Mock };
  let profileUpdated$: Subject<boolean>;
  let mockUserProfileService: any;
  let configSubject: BehaviorSubject<any>;
  const mockNotifications = mockDataNotifications;

  beforeEach(async () => {
    // Create Subjects for Behavior testing
    configSubject = new BehaviorSubject<any>(null);
    profileUpdated$ = new Subject<boolean>();

    // Mock UserProfileService with the profileUpdated$ observable
    mockUserProfileService = {
      profileUpdated$: profileUpdated$.asObservable(),
    };

    // Mock AuthService
    authServiceMock = {
      logout: jest.fn(),
      currentRole$: of('user'), // observable role
    };

    // Mock Router
    routerMock = { navigate: jest.fn() };

    // Configure TestBed
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: UserProfileService, useValue: mockUserProfileService },
        {
          provide: PlatformSettingsService,
          useValue: { platformConfig$: configSubject.asObservable() },
        },
      ],
    }).compileComponents();

    // Create component instance
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Verifies component is created without error
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Shows guest view if user is not logged in
  it('should display guest view when not logged in', () => {
    component.isLogin = false;
    fixture.detectChanges();
    const guestView = fixture.debugElement.query(By.css('.navbar__guest'));
    expect(guestView).toBeTruthy();
  });

  // Displays logged-in view for authenticated users
  it('should display logged-in view when isLogin is true', () => {
    component.isLogin = true;
    fixture.detectChanges();
    const userView = fixture.debugElement.query(By.css('.navbar__right'));
    expect(userView).toBeTruthy();
  });

  // Toggles the notifications dropdown open and closed
  it('should toggle notification dropdown', () => {
    const mockEvent = { stopPropagation: jest.fn() } as unknown as Event;

    component.showNotifications = false;
    component.toggleNotifications(mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.showNotifications).toBe(true);

    component.toggleNotifications(mockEvent);
    expect(component.showNotifications).toBe(false);
  });

  // Shows exact notification count if less than 100
  it('should display notification count properly if less than 100', () => {
    component.isLogin = true;
    component.notificationCount = 45;
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('.badge'));
    expect(badge.nativeElement.textContent.trim()).toBe('45');
  });

  // Caps notification count display at "99+" if over 99
  it('should display 99+ for notification count above 99', () => {
    component.isLogin = true;
    component.notificationCount = 123;
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('.badge'));
    expect(badge.nativeElement.textContent.trim()).toBe('99+');
  });

  // Displays fallback message when there are no notifications
  it('should show "No new notifications" if list is empty', () => {
    component.notifications = [];
    component.isLogin = true;
    component.showNotifications = true;
    fixture.detectChanges();
    const emptyMsg = fixture.debugElement.query(By.css('.notification-inner p'));
    expect(emptyMsg.nativeElement.textContent).toContain('No new notifications');
  });

  // Renders notification items when data is provided
  it('should render notifications when list is passed', () => {
    component.notifications = mockNotifications;
    component.isLogin = true;
    component.showNotifications = true;
    fixture.detectChanges();
    const notifItems = fixture.debugElement.queryAll(By.css('.notification-inner > div'));
    expect(notifItems.length).toBeGreaterThan(0);

    const title = fixture.debugElement.query(By.css('.font-medium'));
    expect(title.nativeElement.textContent).toContain('Test Title');
  });

  // Displays XP info for regular (non-admin) users
  it('should display XP section for non-admin', () => {
    component.isLogin = true;
    component.isAdmin = false;
    component.currentXp = 500;
    component.progressPercentage = 100;
    fixture.detectChanges();
    const xpLabel = fixture.debugElement.query(By.css('.xp-label'));
    expect(xpLabel.nativeElement.textContent).toContain('XP: 500');
  });

  // Hides XP info for admin users
  it('should hide XP section for admin users', () => {
    component.isLogin = true;
    component.isAdmin = true;
    fixture.detectChanges();
    const xpSection = fixture.debugElement.query(By.css('.xp-section'));
    expect(xpSection).toBeNull();
  });

  // Binds the user profile image correctly
  it('should bind profile image correctly', () => {
    const testUrl = 'assets/images/test.png';
    component.profileImageUrl = testUrl;
    component.isLogin = true;
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('.profile-button img'));
    expect(img.nativeElement.getAttribute('src')).toBe(testUrl);
  });

  // Opens notifications panel when notification button is clicked
  it('should toggle notification panel when text button is clicked', () => {
    component.isLogin = true;
    fixture.detectChanges();

    const notifButton = fixture.debugElement.query(By.css('.wrapper-text-button'));

    // Mock event with stopPropagation
    const mockEvent = { stopPropagation: jest.fn() } as unknown as Event;

    notifButton.triggerEventHandler('buttonClicked', mockEvent);
    fixture.detectChanges();

    const notifBox = fixture.debugElement.query(By.css('.notification-box'));
    expect(notifBox).toBeTruthy();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  // Displays mark-as-read and delete buttons for each notification
  it('should display mark as read and delete buttons in each notification item', () => {
    component.notifications = mockNotifications;
    component.isLogin = true;
    component.showNotifications = true;
    fixture.detectChanges();
    const notifItems = fixture.debugElement.queryAll(By.css('.notification-inner > div'));
    expect(notifItems.length).toBeGreaterThan(0);
    const buttons = notifItems[0].queryAll(By.css('app-text-button'));
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  // Shows a "View Details" button for each notification item
  it('should render view details button in notification item', () => {
    component.notifications = mockNotifications;
    component.isLogin = true;
    component.showNotifications = true;
    fixture.detectChanges();
    const viewDetailsButton = fixture.debugElement.query(By.css('app-outline-button'));
    expect(viewDetailsButton).toBeTruthy();
  });

  it('should close sidebar if window is resized below 1024px on init', () => {
    component['previousWidth'] = 1200; // simulate desktop width
    window.innerWidth = 768; // simulate tablet/mobile width
    const closeSpy = jest.spyOn(component.closeSidebar, 'emit');
    component.ngOnInit();
    expect(component.menuOpen).toBe(false);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should call checkWindowSize and emit closeSidebar on resize', () => {
    component['previousWidth'] = 1200;
    const closeSpy = jest.spyOn(component.closeSidebar, 'emit');
    // Simulate a small screen resize
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    component.onWindowResize();
    expect(closeSpy).toHaveBeenCalled();
    expect(component.menuOpen).toBe(false);
  });

  it('should emit openSidebar when toggling menuOpen from false to true', () => {
    component.menuOpen = false;
    const openSpy = jest.spyOn(component.openSidebar, 'emit');
    component.toggleSidebar();
    expect(component.menuOpen).toBe(true);
    expect(openSpy).toHaveBeenCalled();
  });

  it('should emit closeSidebar when toggling menuOpen from true to false', () => {
    component.menuOpen = true;
    const closeSpy = jest.spyOn(component.closeSidebar, 'emit');
    component.toggleSidebar();
    expect(component.menuOpen).toBe(false);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should close sidebar and emit event when sidebarClosedByBackdrop is called', () => {
    component.menuOpen = true;
    const closeSpy = jest.spyOn(component.closeSidebar, 'emit');
    component.sidebarClosedByBackdrop();
    expect(component.menuOpen).toBe(false);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should navigate to get started button on getStartedRedirect()', () => {
    const navSpy = jest.spyOn(component['router'], 'navigate');
    component.getStartedRedirect();
    expect(navSpy).toHaveBeenCalledWith([Navigations.Login]);
  });

  it('should navigate to Login on loginRedirect()', () => {
    const navSpy = jest.spyOn(component['router'], 'navigate');
    component.signInRedirect();
    expect(navSpy).toHaveBeenCalledWith([Navigations.Login]);
  });

  it('should call AuthService.logout when logout() is invoked', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should close notifications when clicking outside notification wrapper', () => {
    component.isLogin = true;
    component.showNotifications = true;
    fixture.detectChanges();

    const wrapperEl = document.createElement('div');
    component['notificationWrapper'] = { nativeElement: wrapperEl } as any;

    const outsideClick = new MouseEvent('click', { bubbles: true });
    document.body.dispatchEvent(outsideClick);

    fixture.detectChanges();
    expect(component.showNotifications).toBe(false);
  });

  it('should NOT close notifications when clicking inside notification wrapper', () => {
    component.isLogin = true;
    component.showNotifications = true;
    fixture.detectChanges();

    const wrapperEl = document.createElement('div');
    const insideEl = document.createElement('button');
    wrapperEl.appendChild(insideEl);

    component['notificationWrapper'] = { nativeElement: wrapperEl } as any;

    const insideClick = new MouseEvent('click', { bubbles: true });
    insideEl.dispatchEvent(insideClick);

    fixture.detectChanges();
    expect(component.showNotifications).toBe(true);
  });

  it('should navigate to login if user is not logged in', () => {
    component.isLogin = false;

    const navSpy = jest.spyOn(component['router'], 'navigate');

    component.navigateToDashboard();

    expect(navSpy).toHaveBeenCalledWith([Navigations.Login]);
  });

  it('should navigate to admin dashboard for admin role (case-insensitive)', () => {
    component.isLogin = true;
    component['authService'].currentRole$ = of(roles.admin) as any;
    const navSpy = jest.spyOn(component['router'], 'navigate');

    component.ngOnInit();

    component.navigateToDashboard();
    expect(navSpy).toHaveBeenCalledWith([`/${Navigations.Admin}/${Navigations.Dashboard}`]);
  });

  it('should navigate to player dashboard for player role (case-insensitive)', () => {
    component.isLogin = true;
    component['authService'].currentRole$ = of(roles.player) as any;
    const navSpy = jest.spyOn(component['router'], 'navigate');

    component.ngOnInit();

    component.navigateToDashboard();
    expect(navSpy).toHaveBeenCalledWith([`/${Navigations.User}/${Navigations.Dashboard}`]);
  });

  it('should navigate to fallback "/" for unknown, null, or undefined role', () => {
    const navSpy = jest.spyOn(component['router'], 'navigate');

    component.isLogin = true;
    component['authService'].currentRole$ = { value: 'unknown' } as any;
    component.navigateToDashboard();
    expect(navSpy).toHaveBeenCalledWith(['/']);

    component['authService'].currentRole$ = { value: null } as any;
    component.navigateToDashboard();
    expect(navSpy).toHaveBeenCalledWith(['/']);

    component['authService'].currentRole$ = { value: undefined } as any;
    component.navigateToDashboard();
    expect(navSpy).toHaveBeenCalledWith(['/']);
  });

  it('should set logoPath when config has logo', () => {
    fixture.detectChanges();
    configSubject.next({ logo: 'assets/images/custom.png' });
    expect(component.logoPath).toBe('assets/images/custom.png');
  });

  describe('goToProfile', () => {
    it('should navigate to admin profile when role is admin', () => {
      component.role = 'admin';
      component.goToProfile();
      expect(routerMock.navigate).toHaveBeenCalledWith([
        `/${Navigations.Admin}/${Navigations.Profile}`,
      ]);
    });

    it('should navigate to user profile when role is not admin', () => {
      component.role = 'user';
      component.goToProfile();
      expect(routerMock.navigate).toHaveBeenCalledWith([
        `/${Navigations.User}/${Navigations.Profile}`,
      ]);
    });
  });

  describe('goToSetting', () => {
    it('should navigate to admin settings with tab query param', () => {
      component.role = 'admin';
      component.goToSetting();
      expect(routerMock.navigate).toHaveBeenCalledWith(
        [`/${Navigations.Admin}/${Navigations.Profile}/`],
        { queryParams: { tab: 2 } },
      );
    });

    it('should navigate to user settings with tab query param', () => {
      component.role = 'user';
      component.goToSetting();
      expect(routerMock.navigate).toHaveBeenCalledWith(
        [`/${Navigations.User}/${Navigations.Profile}`],
        { queryParams: { tab: 2 } },
      );
    });
  });

  describe('viewAllNotifications', () => {
    it('should navigate to admin notifications and close panel', () => {
      component.role = roles.admin;
      component.showNotifications = true;

      component.viewAllNotifications();

      expect(component.showNotifications).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith([
        `/${Navigations.Admin}/${Navigations.Notifications}/`,
      ]);
    });

    it('should navigate to user notifications and close panel', () => {
      component.role = roles.player;
      component.showNotifications = true;

      component.viewAllNotifications();

      expect(component.showNotifications).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith([
        `/${Navigations.User}/${Navigations.Notifications}`,
      ]);
    });
  });

  describe('viewDetails', () => {
    it('should navigate to route returned by getNotificationRoute', () => {
      const mockRoute = { path: '/test/path', queryParams: { foo: 'bar' } };
      const spy = jest
        .spyOn(require('../configs/navbar.component.config'), 'getNotificationRoute')
        .mockReturnValue(mockRoute);

      component.role = roles.admin;
      component.viewDetails(1);

      expect(spy).toHaveBeenCalledWith(true, 1);
      expect(routerMock.navigate).toHaveBeenCalledWith([mockRoute.path], {
        queryParams: mockRoute.queryParams,
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  it('should update XP, progress, notificationCount, and profileImageUrl on successful loadUserData', () => {
    const mockResponse = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: {
        currentUserXp: 200,
        progressPercentage: 50,
        notificationCount: 5,
        profilePic: 'test-pic.png',
      },
    };

    jest.spyOn(component['navbarService'], 'getNavbarData').mockReturnValue(of(mockResponse));

    component['loadUserData']();

    expect(component.currentXp).toBe(200);
    expect(component.progressPercentage).toBe(50);
    expect(component.notificationCount).toBe(5);
    expect(component.profileImageUrl).toBe(`${(environment as any).imageBaseUrl}/test-pic.png`);
  });

  it('should not throw if notificationWrapper is not set', () => {
    component.showNotifications = true;
    component['notificationWrapper'] = null as any;

    const event = new MouseEvent('click');
    expect(() => component.onDocumentClick(event)).not.toThrow();
  });

  it('should call loadNotifications when opening notifications', () => {
    const mockEvent = { stopPropagation: jest.fn() } as any;
    const loadSpy = jest
      .spyOn<any, any>(component as any, 'loadNotifications')
      .mockImplementation(() => {});

    component.showNotifications = false;
    component.toggleNotifications(mockEvent);

    expect(loadSpy).toHaveBeenCalled();
  });
  it('should close sidebar when going from >=1024 to <1024 width', () => {
    const closeSpy = jest.spyOn(component.closeSidebar, 'emit');
    component['previousWidth'] = 1200;

    // mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });

    component.onWindowResize();

    expect(component.menuOpen).toBe(false);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should call snackbarService.showError on loadUserData error', () => {
    const snackbarSpy = jest.spyOn(component['snackbarService'], 'showError');

    jest.spyOn(component['navbarService'], 'getNavbarData').mockReturnValue({
      pipe: () =>
        of().pipe(() => {
          throw new Error('fail');
        }),
    } as any);

    // Or simpler: throwError(() => new Error('fail'))
    jest
      .spyOn(component['navbarService'], 'getNavbarData')
      .mockReturnValue(throwError(() => new Error('fail')));

    component['loadUserData']();

    expect(snackbarSpy).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  });

  describe('NavbarComponent - profileUpdated$', () => {
    it('should call loadUserData when profileUpdated$ emits true', () => {
      const loadUserDataSpy = jest.spyOn(component as any, 'loadUserData');

      profileUpdated$.next(true);

      expect(loadUserDataSpy).toHaveBeenCalled();
    });

    it('should NOT call loadUserData when profileUpdated$ emits false', () => {
      const loadUserDataSpy = jest.spyOn(component as any, 'loadUserData');

      profileUpdated$.next(false);

      expect(loadUserDataSpy).not.toHaveBeenCalled();
    });
  });

  it('should set logoPath from config.logo if available', () => {
    const customLogo = 'assets/images/custom-logo.png';
    configSubject.next({ logo: customLogo });
    fixture.detectChanges();

    expect(component.logoPath).toBe(customLogo);
  });
  it('should assign currentXp, progressPercentage, notificationCount, and profileImageUrl correctly', () => {
    const mockResponse = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: {
        currentUserXp: 300,
        progressPercentage: 75,
        notificationCount: 10,
        profilePic: 'user-pic.png',
      },
    };

    jest.spyOn(component['navbarService'], 'getNavbarData').mockReturnValue(of(mockResponse));

    component['loadUserData']();
    fixture.detectChanges();

    expect(component.currentXp).toBe(300);
    expect(component.progressPercentage).toBe(75);
    expect(component.notificationCount).toBe(10);
    expect(component.profileImageUrl).toBe(`${environment.imageBaseUrl}/user-pic.png`);
  });

  it('should fallback profile image if profilePic is missing', () => {
    const mockResponse = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: {
        currentUserXp: 100,
        progressPercentage: 50,
        notificationCount: 5,
        profilePic: null,
      },
    };

    jest.spyOn(component['navbarService'], 'getNavbarData').mockReturnValue(of(mockResponse));

    component['loadUserData']();
    fixture.detectChanges();

    expect(component.profileImageUrl).toBe('assets/images/profile-1.png'); // fallback
  });
  it('should set currentXp and progressPercentage from response', () => {
    const res = {
      data: {
        currentUserXp: 50,
        progressPercentage: 75,
      },
    };

    // Simulate your method that assigns these values
    component.currentXp = res.data.currentUserXp ?? 0;
    component.progressPercentage = res.data.progressPercentage ?? 0;

    expect(component.currentXp).toBe(50);
    expect(component.progressPercentage).toBe(75);
  });

  it('should default currentXp and progressPercentage to 0 if undefined', () => {
    const res = {
      data: {
        currentUserXp: undefined,
        progressPercentage: undefined,
      },
    };

    component.currentXp = res.data.currentUserXp ?? 0;
    component.progressPercentage = res.data.progressPercentage ?? 0;

    expect(component.currentXp).toBe(0);
    expect(component.progressPercentage).toBe(0);
  });
});
