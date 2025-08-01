import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ResetLinkSendSuccessfullyComponent } from './reset-link-send-successfully.component';
import { Navigations } from '../../../../shared/enums/navigation';

describe('ResetLinkSendSuccessfullyComponent', () => {
  let component: ResetLinkSendSuccessfullyComponent;
  let fixture: ComponentFixture<ResetLinkSendSuccessfullyComponent>;
  let router: Router;

  beforeEach(async () => {
    // Mock window.history.state to simulate passed email value
    Object.defineProperty(window, 'history', {
      writable: true,
      value: {
        state: {
          email: 'test@example.com',
        },
      },
    });

    await TestBed.configureTestingModule({
      imports: [ResetLinkSendSuccessfullyComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetLinkSendSuccessfullyComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Should create the component
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Should initialize email from window.history.state
  it('should initialize email from window.history.state', () => {
    component.ngOnInit();
    expect(component.email).toBe('test@example.com');
  });

  // Should navigate to ForgotPassword on "Send Another Email" click
  it('should navigate to ForgotPassword on "Send Another Email" click', () => {
    component.onSendAnotherEmailClick();
    expect(router.navigate).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });

  // Should navigate to Login on "Sign In" click
  it('should navigate to Login on "Sign In" click', () => {
    component.onSignInClick();
    expect(router.navigate).toHaveBeenCalledWith([Navigations.Login]);
  });

  // Should have defined button configurations
  it('should have defined button configs', () => {
    expect(component.loginButton).toBeDefined();
    expect(component.sendAnotherEmailButton).toBeDefined();
  });

  // Should set email as empty string if email is not provided in state
  it('should set email as empty string if email is not provided in state', () => {
    Object.defineProperty(window, 'history', {
      writable: true,
      value: { state: {} },
    });

    const newFixture = TestBed.createComponent(ResetLinkSendSuccessfullyComponent);
    const newComponent = newFixture.componentInstance;
    newComponent.ngOnInit();

    expect(newComponent.email).toBe('');
  });
});
