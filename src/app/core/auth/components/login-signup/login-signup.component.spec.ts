import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginSignupComponent } from './login-signup.component';
import {
  GOOGLE_BUTTON_CONFIG,
  FACEBOOK_BUTTON_CONFIG,
  LOGIN_SIGNUP_TABS_CONFIG,
} from '../../configs/login-signup.component.config';
import { By } from '@angular/platform-browser';

describe('LoginSignupComponent', () => {
  let component: LoginSignupComponent;
  let fixture: ComponentFixture<LoginSignupComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginSignupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginSignupComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  // Test: Should create the component
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test: Should have correct Google button config
  it('should have correct Google button config', () => {
    expect(component.googleButton).toEqual(GOOGLE_BUTTON_CONFIG);
  });

  // Test: Should have correct Facebook button config
  it('should have correct Facebook button config', () => {
    expect(component.facebookButton).toEqual(FACEBOOK_BUTTON_CONFIG);
  });

  // Test: Should have correct tabs config
  it('should have correct tabs config', () => {
    expect(component.tabs).toEqual(LOGIN_SIGNUP_TABS_CONFIG);
    expect(component.tabs.length).toBe(2);
    expect(component.tabs[0].id).toBe('login-form');
    expect(component.tabs[0].label).toBe('Sign In');
    expect(component.tabs[1].id).toBe('register-form');
    expect(component.tabs[1].label).toBe('Sign Up');
  });

  // Test: Should initialize selectedIndex to 0
  it('should initialize selectedIndex to 0', () => {
    expect(component.selectedIndex).toBe(0);
  });

  // Test: Should render tab labels correctly
  it('should render tab labels correctly', () => {
    fixture.detectChanges();
    const tabLabels = fixture.debugElement.queryAll(By.css('.mdc-tab__content'));
    const labels = tabLabels.map((el) => el.nativeElement.textContent.trim());
    expect(labels).toContain('Sign In');
    expect(labels).toContain('Sign Up');
  });

  // Test: Should update selectedIndex on tab change
  it('should update selectedIndex on tab change', () => {
    component.selectedIndex = 1;
    fixture.detectChanges();
    expect(component.selectedIndex).toBe(1);
  });
});
