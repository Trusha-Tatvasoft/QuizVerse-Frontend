import { TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule],
    }).compileComponents();

    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Verifies component instance is created
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Ensures form is initialized with empty email field
  it('should initialize the form with empty fields', () => {
    expect(component.forgotPasswordForm.value).toEqual({ email: '' });
  });

  // Should mark form as touched and prevent submit if invalid
  it('should mark form as touched and not proceed when form is invalid', () => {
    jest.spyOn(component.forgotPasswordForm, 'markAllAsTouched');
    component.onSubmit();
    expect(component.forgotPasswordForm.markAllAsTouched).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  // Simulates valid form submit and checks loading, navigation, and reset
  it('should set loading, navigate and stop loading after submit if form is valid', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.forgotPasswordForm.setValue({ email: 'test@example.com' });
    component.onSubmit();

    expect(component.isLoading).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    expect(component.isLoading).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/reset-password-link-success'], {
      state: { email: 'test@example.com' },
    });
  });

  // Disables button when loading is true
  it('should disable the button when loading', () => {
    component.isLoading = true;
    expect(component.buttonConfig.isDisabled).toBe(true);
  });

  // Enables button when loading is false
  it('should enable the button when not loading', () => {
    component.isLoading = false;
    expect(component.buttonConfig.isDisabled).toBe(false);
  });

  // Checks button config matches base configuration
  it('should use SEND_RESET_LINK_CONFIG as base config for button', () => {
    expect(component.buttonConfig.label).toBe(component.sendResetLinkButton.label);
  });
});
