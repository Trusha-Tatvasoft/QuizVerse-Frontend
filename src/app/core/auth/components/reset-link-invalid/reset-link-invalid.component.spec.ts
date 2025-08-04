import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ResetLinkInvalidComponent } from './reset-link-invalid.component';
import { Router } from '@angular/router';
import { Navigations } from '../../../../shared/enums/navigation';

describe('ResetLinkInvalidComponent', () => {
  let component: ResetLinkInvalidComponent;
  let fixture: ComponentFixture<ResetLinkInvalidComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetLinkInvalidComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetLinkInvalidComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Ensures the component is created successfully
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Verifies navigation to ForgotPassword page on button click
  it('should navigate to ForgotPassword on "Request New Reset Link" click', () => {
    component.onRequestNewResetLink();
    expect(router.navigate).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });

  // Verifies navigation to Login page on button click
  it('should navigate to Login on "Back to Sign In" click', () => {
    component.onBackToSignInClick();
    expect(router.navigate).toHaveBeenCalledWith([Navigations.Login]);
  });

  // Checks that the NewResetLinkButton config is defined
  it('should have NewResetLinkButton config defined', () => {
    expect(component.NewResetLinkButton).toBeDefined();
  });

  // Checks that the BackToSignInButton config is defined
  it('should have BackToSignInButton config defined', () => {
    expect(component.BackToSignInButton).toBeDefined();
  });
});
