import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LoaderService } from '../../../../shared/service/loader/loader.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let router: Router;
  let loaderService: LoaderService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    loaderService = TestBed.inject(LoaderService);
    fixture.detectChanges();
  });

  // Basic component creation test
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Check if form initializes with an empty email field
  it('should initialize the form with empty email field', () => {
    expect(component.forgotPasswordForm.value).toEqual({ email: '' });
  });

  // Ensure form is marked as touched and loader is not triggered when form is invalid
  it('should mark form as touched and not submit if invalid', () => {
    const markTouchedSpy = jest.spyOn(component.forgotPasswordForm, 'markAllAsTouched');
    const loaderSpy = jest.spyOn(loaderService, 'show');

    component.onSubmit(); // Trigger submit with invalid form

    expect(markTouchedSpy).toHaveBeenCalled(); // Form should be marked as touched
    expect(loaderSpy).not.toHaveBeenCalled(); // Loader should not show
  });

  // Ensure valid submission triggers loader, navigation, and hides loader after delay
  it('should show loader, navigate, and hide loader on valid submit', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const showSpy = jest.spyOn(loaderService, 'show');
    const hideSpy = jest.spyOn(loaderService, 'hide');

    // Set form to valid state
    component.forgotPasswordForm.setValue({ email: 'test@example.com' });

    jest.useFakeTimers(); // Simulate time delay
    component.onSubmit();

    expect(showSpy).toHaveBeenCalled(); // Loader should start

    jest.advanceTimersByTime(1000); // Simulate the timeout delay
    expect(hideSpy).toHaveBeenCalled(); // Loader should stop

    expect(navigateSpy).toHaveBeenCalledWith(['reset-password-link-success'], {
      state: { email: 'test@example.com' },
    });

    jest.useRealTimers(); // Reset timers after test
  });

  // Check that button config uses correct label from SEND_RESET_LINK_CONFIG
  it('should use SEND_RESET_LINK_CONFIG for button label', () => {
    expect(component.sendResetLinkButton.label).toBeDefined();
  });
});
