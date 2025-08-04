import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginSignupComponent } from './login-signup.component';
import {
  GOOGLE_BUTTON_CONFIG,
  FACEBOOK_BUTTON_CONFIG,
  LOGIN_SIGNUP_TABS_CONFIG,
} from '../../configs/login-signup.component.config';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

describe('LoginSignupComponent', () => {
  let component: LoginSignupComponent;
  let fixture: ComponentFixture<LoginSignupComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginSignupComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginSignupComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  // Should create the component instance
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Should match Google button configuration with expected constant
  it('should have correct Google button config', () => {
    expect(component.googleButton).toEqual(GOOGLE_BUTTON_CONFIG);
  });

  // Should match Facebook button configuration with expected constant
  it('should have correct Facebook button config', () => {
    expect(component.facebookButton).toEqual(FACEBOOK_BUTTON_CONFIG);
  });

  // Should initialize tabs with correct values and order
  it('should have correct tabs config', () => {
    expect(component.tabs).toEqual(LOGIN_SIGNUP_TABS_CONFIG);
    expect(component.tabs.length).toBe(2);
    expect(component.tabs[0].id).toBe('login-form');
    expect(component.tabs[0].label).toBe('Sign In');
    expect(component.tabs[1].id).toBe('register-form');
    expect(component.tabs[1].label).toBe('Sign Up');
  });

  // Should initialize selectedIndex to 0 (Sign In)
  it('should initialize selectedIndex to 0', () => {
    expect(component.selectedIndex).toBe(0);
  });

  // Should render tab labels for Sign In and Sign Up
  it('should render tab labels correctly', () => {
    const tabLabels = fixture.debugElement.queryAll(By.css('.mdc-tab__content'));
    const labels = tabLabels.map((el) => el.nativeElement.textContent.trim());
    expect(labels).toContain('Sign In');
    expect(labels).toContain('Sign Up');
  });

  // Should update selectedIndex when user switches tab
  it('should update selectedIndex on tab change', () => {
    component.selectedIndex = 1;
    fixture.detectChanges();
    expect(component.selectedIndex).toBe(1);
  });
});
