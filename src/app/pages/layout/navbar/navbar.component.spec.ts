import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NavbarComponent } from './navbar.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { yellow } from '../../../utils/constants';
import { mockDataNotifications } from './navbar-mock-data';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let warning = yellow;

  const mockNotifications = mockDataNotifications;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
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
    component.showNotifications = false;
    component.toggleNotifications();
    expect(component.showNotifications).toBe(true);

    component.toggleNotifications();
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
    component.xpLimit = 1000;
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
    notifButton.triggerEventHandler('buttonClicked', null);
    fixture.detectChanges();

    const notifBox = fixture.debugElement.query(By.css('.notification-box'));
    expect(notifBox).toBeTruthy();
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
});
