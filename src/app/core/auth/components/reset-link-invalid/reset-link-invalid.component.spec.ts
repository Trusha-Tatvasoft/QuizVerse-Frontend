import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ResetLinkInvalidComponent } from './reset-link-invalid.component';
import { Navigations } from '../../../../shared/enums/navigation';

// Mock Router
const routerSpy = {
  navigate: jest.fn(),
};

describe('ResetLinkInvalidComponent', () => {
  let component: ResetLinkInvalidComponent;
  let fixture: ComponentFixture<ResetLinkInvalidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetLinkInvalidComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetLinkInvalidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Clear router mocks after each test to prevent test leakage
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Verifies component instance is created
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Checks initial loading state is false
  it('should have loading set to false initially', () => {
    expect(component.isLoading).toBe(false);
  });

  // Verifies navigation to ForgotPassword when user clicks request new reset link
  it('should navigate to ForgotPassword on "Request New Reset Link" click', () => {
    component.onRequestNewResetLink();
    expect(routerSpy.navigate).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });

  // Verifies navigation to Login when user clicks back to sign in
  it('should navigate to Login on "Back to Sign In" click', () => {
    component.onBackToSignInClick();
    expect(routerSpy.navigate).toHaveBeenCalledWith([Navigations.Login]);
  });

  // Checks if NewResetLinkButton config is initialized
  it('should have NewResetLinkButton config defined', () => {
    expect(component.NewResetLinkButton).toBeDefined();
  });

  // Checks if BackToSignInButton config is initialized
  it('should have BackToSignInButton config defined', () => {
    expect(component.BackToSignInButton).toBeDefined();
  });
});
