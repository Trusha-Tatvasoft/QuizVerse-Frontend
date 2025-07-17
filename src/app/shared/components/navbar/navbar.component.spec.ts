import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NavbarComponent } from './navbar.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Notifications } from '../../interfaces/navbar.component.interface';
import { yellow } from '../../../utils/constants';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let warning = yellow;

  const mockNotifications: Notifications[] = [
    {
      id: '1',
      title: 'Test Title',
      message: 'Test message content',
      timeAgo: '1 min ago',
      type: 'info',
      read: false,
      tagConfig: warning,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      schemas: [NO_ERRORS_SCHEMA], // Ignore unknown components like app-text-button, app-tag, etc.
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display guest view when not logged in', () => {
    component.isLogin = false;
    fixture.detectChanges();

    const guestView = fixture.debugElement.query(By.css('.navbar__guest'));
    expect(guestView).toBeTruthy();
  });

  it('should display logged-in view when isLogin is true', () => {
    component.isLogin = true;
    fixture.detectChanges();

    const userView = fixture.debugElement.query(By.css('.navbar__right'));
    expect(userView).toBeTruthy();
  });

  it('should toggle notification dropdown', () => {
    component.showNotifications = false;
    component.toggleNotifications();
    expect(component.showNotifications).toBe(true);

    component.toggleNotifications();
    expect(component.showNotifications).toBe(false);
  });

  it('should display notification count properly if less than 100', () => {
    component.isLogin = true;
    component.notificationCount = 45;
    expect(component['notificationCount']).toBe(45);
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('.badge'));
    expect(badge.nativeElement.textContent.trim()).toBe('45');
  });

  it('should display 99+ for notification count above 99', () => {
    component.isLogin = true;
    component.notificationCount = 123;
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('.badge'));
    expect(badge.nativeElement.textContent.trim()).toBe('99+');
  });

  it('should show "No new notifications" if list is empty', () => {
    component.notifications = [];
    component.isLogin = true;
    component.showNotifications = true;
    fixture.detectChanges();

    const emptyMsg = fixture.debugElement.query(By.css('.notification-inner p'));
    expect(emptyMsg.nativeElement.textContent).toContain('No new notifications');
  });

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

  it('should display XP section for non-admin', () => {
    component.isLogin = true;
    component.isAdmin = false;
    component.currentXp = 500;
    component.xpLimit = 1000;
    fixture.detectChanges();

    const xpLabel = fixture.debugElement.query(By.css('.xp-label'));
    expect(xpLabel.nativeElement.textContent).toContain('XP: 500');
  });

  it('should hide XP section for admin users', () => {
    component.isLogin = true;
    component.isAdmin = true;
    fixture.detectChanges();

    const xpSection = fixture.debugElement.query(By.css('.xp-section'));
    expect(xpSection).toBeNull();
  });

  it('should bind profile image correctly', () => {
    const testUrl = 'assets/images/test.png';
    component.profileImageUrl = testUrl;
    component.isLogin = true;
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css('.profile-button img'));
    expect(img.nativeElement.getAttribute('src')).toBe(testUrl);
  });

  it('should toggle notification panel when text button is clicked', () => {
    component.isLogin = true;
    fixture.detectChanges();

    const notifButton = fixture.debugElement.query(By.css('.wrapper-text-button'));
    notifButton.triggerEventHandler('buttonClicked', null); // emits from <app-text-button>
    fixture.detectChanges();

    const notifBox = fixture.debugElement.query(By.css('.notification-box'));
    expect(notifBox).toBeTruthy(); // Now open
  });

  it('should display mark as read and delete buttons in each notification item', () => {
    component.notifications = mockNotifications;
    component.isLogin = true;
    component.showNotifications = true;
    fixture.detectChanges();

    const notifItems = fixture.debugElement.queryAll(By.css('.notification-inner > div'));
    expect(notifItems.length).toBeGreaterThan(0);

    const buttons = notifItems[0].queryAll(By.css('app-text-button'));
    // Expect at least 2 buttons: mark as read + delete
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should render view details button in notification item', () => {
    component.notifications = mockNotifications;
    component.isLogin = true;
    component.showNotifications = true;
    fixture.detectChanges();

    const viewDetailsButton = fixture.debugElement.query(By.css('app-outline-button'));
    expect(viewDetailsButton).toBeTruthy();
  });

  it('should render XP section in profile menu for non-admin users', async () => {
    component.isLogin = true;
    component.isAdmin = false;
    component.currentXp = 700;
    component.xpLimit = 1000;
    fixture.detectChanges();

    // Trigger the profile menu open
    const triggerButton = fixture.debugElement.query(By.css('.profile-button'));
    triggerButton.nativeElement.click();
    fixture.detectChanges();

    // Wait for the menu to appear in DOM
    await fixture.whenStable();

    const menuXp = document.querySelector('.profile-menu-xp .xp-label') as HTMLElement;
    expect(menuXp).toBeTruthy();
    expect(menuXp.textContent).toContain('XP: 700');
  });
});
