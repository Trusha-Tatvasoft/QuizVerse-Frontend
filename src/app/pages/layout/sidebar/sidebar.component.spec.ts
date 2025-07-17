import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { SidebarItem } from '../../../shared/interfaces/sidebar-component.interface';
import { MatSidenav } from '@angular/material/sidenav';

const mockSidebarItems: SidebarItem[] = [
  { label: 'Home', icon: 'home', route: '/home' },
  { label: 'Profile', icon: 'person', route: '/profile' },
];

const mockRouter = {
  url: '/',
  navigate: jest.fn(),
};

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    component.sidebarItems = mockSidebarItems;
    component.role = 'user';
    fixture.detectChanges();
  });

  afterEach(() => jest.clearAllMocks());

  it('should initialize in mobile layout when screen width is less than 1024px', () => {
    const screenWidth = 800;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: screenWidth,
    });

    const setSidenavModeSpy = jest.spyOn(component, 'setSidenavMode');

    component.ngOnInit();

    expect(setSidenavModeSpy).toHaveBeenCalledWith(screenWidth);

    expect(component.isMobile).toBe(true);
    expect(component.sidenavMode).toBe('over');
    expect(component.isOpen).toBe(false);
  });

  it('should initialize in desktop layout when screen width is 1024px or more', () => {
    const screenWidth = 1300;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: screenWidth,
    });

    component.ngOnInit();

    expect(component.isMobile).toBe(false);
    expect(component.sidenavMode).toBe('side');
    expect(component.isOpen).toBe(true);
  });

  it('should redirect to the first sidebar route when current URL is root "/"', () => {
    mockRouter.url = '/';
    jest.clearAllMocks();

    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should NOT redirect if the current URL is already on a valid route', () => {
    mockRouter.url = '/profile';
    jest.clearAllMocks();

    component.ngOnInit();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should update sidenav mode on resize to mobile if width < 1024', () => {
    const newWidth = 500;
    const spy = jest.spyOn(component, 'setSidenavMode');

    component.onResize({ target: { innerWidth: newWidth } });

    expect(spy).toHaveBeenCalledWith(newWidth);
    expect(component.isMobile).toBe(true);
    expect(component.sidenavMode).toBe('over');
    expect(component.isOpen).toBe(false);
  });

  it('should update sidenav mode on resize to desktop if width >= 1024', () => {
    const newWidth = 1300;

    component.onResize({ target: { innerWidth: newWidth } });

    expect(component.isMobile).toBe(false);
    expect(component.sidenavMode).toBe('side');
    expect(component.isOpen).toBe(true);
  });

  it('should switch to mobile mode when setSidenavMode called with width < 1024', () => {
    const screenWidth = 500;

    component.setSidenavMode(screenWidth);

    expect(component.isMobile).toBe(true);
    expect(component.sidenavMode).toBe('over');
    expect(component.isOpen).toBe(false);
  });

  it('should switch to desktop mode when setSidenavMode called with width >= 1024', () => {
    const screenWidth = 1300;

    component.setSidenavMode(screenWidth);

    expect(component.isMobile).toBe(false);
    expect(component.sidenavMode).toBe('side');
    expect(component.isOpen).toBe(true);
  });

  it('should toggle the sidenav when toggleSidebar is called', () => {
    const toggleMock = jest.fn();
    const sidenavStub = { toggle: toggleMock } as unknown as MatSidenav;

    component.sidenav = sidenavStub;

    component.toggleSidebar();

    expect(toggleMock).toHaveBeenCalledTimes(1);
  });

  it('should close sidenav only when on mobile', () => {
    const closeMock = jest.fn();
    component.sidenav = { close: closeMock } as unknown as MatSidenav;

    component.isMobile = true;
    component.closeSidebar();
    expect(closeMock).toHaveBeenCalledTimes(1);

    closeMock.mockClear();
    component.isMobile = false;
    component.closeSidebar();
    expect(closeMock).not.toHaveBeenCalled();
  });

  it('should navigate to the given route and close the sidebar exactly once', () => {
    const closeSidebarSpy = jest.spyOn(component, 'closeSidebar');

    component.navigateTo('/profile');

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    expect(closeSidebarSpy).toHaveBeenCalledTimes(1);
  });

  it('should return false from isActive when provided route does not match current URL', () => {
    mockRouter.url = '/dashboard';
    const result = component.isActive('/settings');
    expect(result).toBe(false);
  });

  it('should return true from isActive when provided route matches current URL', () => {
    mockRouter.url = '/settings';
    const result = component.isActive('/settings');
    expect(result).toBe(true);
  });

  it('should display each sidebar item with the correct label and icon', () => {
    fixture.detectChanges();

    const labels = fixture.debugElement.queryAll(By.css('.sidebar-label'));
    const icons = fixture.debugElement.queryAll(By.css('.sidebar-icon'));

    expect(labels.length).toBe(2);
    expect(icons.length).toBe(2);

    expect(labels[0].nativeElement.textContent.trim()).toBe('Home');
    expect(icons[0].nativeElement.textContent.trim()).toContain('home');

    expect(labels[1].nativeElement.textContent.trim()).toBe('Profile');
    expect(icons[1].nativeElement.textContent.trim()).toContain('person');
  });
});
