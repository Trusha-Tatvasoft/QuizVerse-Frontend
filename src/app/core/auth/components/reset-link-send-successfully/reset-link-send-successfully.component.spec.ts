import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetLinkSendSuccessfullyComponent } from './reset-link-send-successfully.component';
import { Router } from '@angular/router';
import { Navigations } from '../../../../shared/enums/navigation';

describe('ResetLinkSendSuccessfullyComponent', () => {
  let component: ResetLinkSendSuccessfullyComponent;
  let fixture: ComponentFixture<ResetLinkSendSuccessfullyComponent>;
  let routerMock: { navigate: jest.Mock };

  beforeEach(async () => {
    // Mock browser history state with an email
    Object.defineProperty(window, 'history', {
      writable: true,
      value: {
        state: {
          email: 'test@example.com',
        },
      },
    });

    // Mock Router
    routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ResetLinkSendSuccessfullyComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetLinkSendSuccessfullyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Verifies component is created
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Ensures email is initialized from history state
  it('should initialize email from window.history.state', () => {
    component.ngOnInit();
    expect(component.email).toBe('test@example.com');
  });

  // Verifies navigation to ForgotPassword page
  it('should navigate to ForgetPassword when onSendAnotherEmailClick is called', () => {
    component.onSendAnotherEmailClick();
    expect(routerMock.navigate).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });

  // Verifies navigation to Login page
  it('should navigate to Login when onSignInClick is called', () => {
    component.onSignInClick();
    expect(routerMock.navigate).toHaveBeenCalledWith([Navigations.Login]);
  });

  // Checks initial loading state is false
  it('should have isLoading initially false', () => {
    expect(component.isLoading).toBe(false);
  });

  // Confirms button configurations are defined
  it('should have defined button configs', () => {
    expect(component.loginButton).toBeDefined();
    expect(component.sendAnotherEmailButton).toBeDefined();
  });

  // Checks fallback behavior when email is not available in state
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
