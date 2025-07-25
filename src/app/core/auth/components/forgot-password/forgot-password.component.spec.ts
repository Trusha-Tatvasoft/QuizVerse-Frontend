import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent], // since it's standalone
      providers: [provideRouter([])], // mock router for RouterLink
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty email field', () => {
    expect(component.forgotPasswordForm.value).toEqual({ email: '' });
  });

  it('should mark form as touched and not submit if invalid', () => {
    const spy = jest.spyOn(component.forgotPasswordForm, 'markAllAsTouched');
    component.onSubmit();
    expect(spy).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should handle valid form submit: set loading, navigate, and stop loading', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.forgotPasswordForm.setValue({ email: 'test@example.com' });

    jest.useFakeTimers();
    component.onSubmit();

    expect(component.isLoading).toBe(true);

    jest.advanceTimersByTime(1000); // simulate timeout delay
    expect(component.isLoading).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['reset-password-link-success'], {
      state: { email: 'test@example.com' },
    });

    jest.useRealTimers();
  });

  it('should disable the button when loading', () => {
    component.isLoading = true;
    expect(component.buttonConfig.isDisabled).toBe(true);
  });

  it('should enable the button when not loading', () => {
    component.isLoading = false;
    expect(component.buttonConfig.isDisabled).toBe(false);
  });

  it('should use SEND_RESET_LINK_CONFIG for button label', () => {
    expect(component.buttonConfig.label).toBe(component.sendResetLinkButton.label);
  });
});
