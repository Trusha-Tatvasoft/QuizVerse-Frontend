import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ResetLinkSendSuccessfullyComponent } from './reset-link-send-successfully.component';
import { Navigations } from '../../../../shared/enums/navigation';

describe('ResetLinkSendSuccessfullyComponent', () => {
  let component: ResetLinkSendSuccessfullyComponent;
  let fixture: ComponentFixture<ResetLinkSendSuccessfullyComponent>;
  let router: Router;

  beforeEach(async () => {
    // Mock window.history.state with test email
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
      providers: [provideRouter([])], //  Using dummy routes
    }).compileComponents();

    fixture = TestBed.createComponent(ResetLinkSendSuccessfullyComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate'); //  Spy on real router

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize email from window.history.state', () => {
    component.ngOnInit();
    expect(component.email).toBe('test@example.com');
  });

  it('should navigate to ForgotPassword on "Send Another Email" click', () => {
    component.onSendAnotherEmailClick();
    expect(router.navigate).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });

  it('should navigate to Login on "Sign In" click', () => {
    component.onSignInClick();
    expect(router.navigate).toHaveBeenCalledWith([Navigations.Login]);
  });

  it('should have isLoading initially false', () => {
    expect(component.isLoading).toBe(false);
  });

  it('should have defined button configs', () => {
    expect(component.loginButton).toBeDefined();
    expect(component.sendAnotherEmailButton).toBeDefined();
  });

  it('should set email as empty string if email is not provided in state', () => {
    Object.defineProperty(window, 'history', {
      writable: true,
      value: {
        state: {},
      },
    });

    const newFixture = TestBed.createComponent(ResetLinkSendSuccessfullyComponent);
    const newComponent = newFixture.componentInstance;
    newComponent.ngOnInit();

    expect(newComponent.email).toBe('');
  });
});
