import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginSignupComponent, selectedTabIndexSignal } from './login-signup.component';
import {
  googleButtonConfig,
  facebookButtonConfig,
  loginSignUpTabsConfig,
} from '../../configs/login-signup.component.config';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PlatformSettingsService } from '../../../../services/admin/platform-settings/platform-settings.service';
import { BehaviorSubject } from 'rxjs';

describe('LoginSignupComponent', () => {
  let component: LoginSignupComponent;
  let fixture: ComponentFixture<LoginSignupComponent>;
  let compiled: HTMLElement;
  let platformConfig$: BehaviorSubject<any>;
  let platformSettingsService: PlatformSettingsService;

  beforeEach(async () => {
    platformConfig$ = new BehaviorSubject<any>(null);

    await TestBed.configureTestingModule({
      imports: [LoginSignupComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        {
          provide: PlatformSettingsService,
          useValue: { platformConfig$: platformConfig$.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginSignupComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    platformSettingsService = TestBed.inject(PlatformSettingsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct Google button config', () => {
    expect(component.googleButton).toEqual(googleButtonConfig);
  });

  it('should have correct Facebook button config', () => {
    expect(component.facebookButton).toEqual(facebookButtonConfig);
  });

  it('should have correct tabs config', () => {
    expect(component.tabs).toEqual(loginSignUpTabsConfig);
    expect(component.tabs.length).toBe(2);
  });

  it('should initialize selectedIndex to 0', () => {
    expect(component.selectedIndex).toBe(0);
    expect(selectedTabIndexSignal()).toBe(0);
  });

  it('should render tab labels correctly', () => {
    const tabLabels = fixture.debugElement.queryAll(By.css('.mdc-tab__content'));
    const labels = tabLabels.map((el) => el.nativeElement.textContent.trim());
    expect(labels).toContain('Sign In');
    expect(labels).toContain('Sign Up');
  });

  it('should update selectedIndex and signal on tab change', () => {
    component.switchToTab(1);
    fixture.detectChanges();
    expect(component.selectedIndex).toBe(1);
    expect(selectedTabIndexSignal()).toBe(1);
  });

  it('should reflect signal change in component', () => {
    selectedTabIndexSignal.set(1);
    fixture.detectChanges();
    expect(component.selectedIndex).toBe(1);
  });

  it('should set logoPath when config with logo is emitted', () => {
    platformConfig$.next({ logo: 'assets/logo.png' });
    fixture.detectChanges();
    expect(component.logoPath).toBe('assets/logo.png');
  });

  it('should set logoPath to null when config has no logo', () => {
    platformConfig$.next({});
    fixture.detectChanges();
    expect(component.logoPath).toBeNull();
  });

  it('should set logoPath to null when onImageError is called', () => {
    component.logoPath = 'somepath.png';
    component.imageError();
    expect(component.logoPath).toBeNull();
  });
});
