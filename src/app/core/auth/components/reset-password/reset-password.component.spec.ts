import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { ForgotResetPasswordService } from '../../services/forgot-reset-password.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { SEND_RESET_LINK_CONFIG } from '../../configs/reset-password.component.config';
import { Router, ActivatedRoute } from '@angular/router';
import { Navigations } from '../../../../shared/enums/navigation';
import { PlatformMessages } from '../../../../utils/constants';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let validationErrorService: ValidationErrorService;
  let authService: ForgotResetPasswordService;
  let snackbarService: SnackbarService;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        {
          provide: ValidationErrorService,
          useValue: {
            getErrorMessage: jest.fn(),
          },
        },
        {
          provide: ForgotResetPasswordService,
          useValue: {
            verifyResetToken: jest.fn().mockReturnValue(
              of({
                result: true,
                statusCode: 200,
                message: 'Token valid',
                data: true,
              }),
            ),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: SnackbarService,
          useValue: {
            showSuccess: jest.fn(),
            showError: jest.fn(),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'token' ? 'test-reset-token' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    validationErrorService = TestBed.inject(ValidationErrorService);
    authService = TestBed.inject(ForgotResetPasswordService);
    snackbarService = TestBed.inject(SnackbarService);
    router = TestBed.inject(Router);

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with all reset fields', () => {
    component.resetFields.forEach((field) => {
      expect(component.resetForm.contains(field.name)).toBe(true);
    });
  });

  it('should read reset token from query params', () => {
    expect(component.resetToken).toBe('test-reset-token');
  });

  it('should mark form as touched and return if invalid', () => {
    const markSpy = jest.spyOn(component.resetForm, 'markAllAsTouched');
    component.onSubmit();
    expect(markSpy).toHaveBeenCalled();
  });

  it('should call resetPassword and show success snackbar on valid form', () => {
    const credentials = {
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };
    component.resetForm.setValue(credentials);

    const resetSpy = jest
      .spyOn(authService, 'resetPassword')
      .mockReturnValue(
        of({ result: true, statusCode: 200, message: 'Password reset successfully', data: null }),
      );

    const successSpy = jest.spyOn(snackbarService, 'showSuccess');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.onSubmit();

    expect(resetSpy).toHaveBeenCalledWith({
      password: credentials.password,
      resetPasswordToken: 'test-reset-token',
    });
    expect(successSpy).toHaveBeenCalledWith('Success', 'Password reset successfully');
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.Login]);
  });

  it('should show error snackbar and navigate to forget-password if reset fails (non-200)', () => {
    const credentials = {
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };
    component.resetForm.setValue(credentials);

    jest
      .spyOn(authService, 'resetPassword')
      .mockReturnValue(
        of({ result: false, statusCode: 400, message: 'Invalid token', data: null }),
      );

    const errorSpy = jest.spyOn(snackbarService, 'showError');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.onSubmit();

    expect(errorSpy).toHaveBeenCalledWith('Error! 400', 'Invalid token');
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });

  it('should show error snackbar and navigate to forget-password on HTTP error', () => {
    const credentials = {
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };
    component.resetForm.setValue(credentials);

    jest
      .spyOn(authService, 'resetPassword')
      .mockReturnValue(throwError(() => ({ error: { message: 'Server error' } })));

    const errorSpy = jest.spyOn(snackbarService, 'showError');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.onSubmit();

    expect(errorSpy).toHaveBeenCalledWith('Error', 'Server error');
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });

  it('should show password mismatch error when passwords do not match', () => {
    const form = component.resetForm;
    form.get('password')?.setValue('abc123');
    form.get('confirmPassword')?.setValue('xyz789');

    component.passwordMatchValidator(form);

    expect(form.get('confirmPassword')?.errors?.['passwordMismatch']).toBeTruthy();
  });

  it('should clear password mismatch error when passwords match and previously had error', () => {
    const form = component.resetForm;
    const confirmPassword = form.get('confirmPassword');

    confirmPassword?.setErrors({ passwordMismatch: true });
    form.get('password')?.setValue('abc123');
    confirmPassword?.setValue('abc123');

    component.passwordMatchValidator(form);

    expect(confirmPassword?.errors).toBeNull();
  });

  it('should not set passwordMismatch error if confirmPassword is empty', () => {
    const form = component.resetForm;
    form.get('password')?.setValue('Password123!');
    form.get('confirmPassword')?.setValue('');

    component.passwordMatchValidator(form);

    expect(form.get('confirmPassword')?.hasError('passwordMismatch')).toBe(false);
  });

  it('should return validation error message via getError()', () => {
    const control = component.resetForm.get('password');
    control?.setValue('');
    control?.markAsTouched();

    jest.spyOn(validationErrorService, 'getErrorMessage').mockReturnValue('Password is required.');

    const error = component.getError('password');
    expect(error).toBe('Password is required.');
  });

  it('should return null from getError() if field config not found', () => {
    jest.spyOn(validationErrorService, 'getErrorMessage').mockReturnValue(null);
    const error = component.getError('nonExistent');
    expect(error).toBeNull();
  });

  it('should use SEND_RESET_LINK_CONFIG for button config', () => {
    expect(component.sendResetLinkButton).toBe(SEND_RESET_LINK_CONFIG);
  });

  it('should show error and navigate if verifyResetToken returns data false', () => {
    jest
      .spyOn(authService, 'verifyResetToken')
      .mockReturnValue(
        of({ result: true, statusCode: 200, message: 'Token invalid', data: false }),
      );

    const errorSpy = jest.spyOn(snackbarService, 'showError');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.ngOnInit();

    expect(errorSpy).toHaveBeenCalledWith('Error! 200', 'Token invalid');
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.ResetLinkInvalid]);
  });

  it('should handle error if verifyResetToken throws error', () => {
    jest
      .spyOn(authService, 'verifyResetToken')
      .mockReturnValue(throwError(() => ({ error: { message: 'Invalid or expired token' } })));

    const errorSpy = jest.spyOn(snackbarService, 'showError');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.ngOnInit();

    expect(errorSpy).toHaveBeenCalledWith('Error', 'Invalid or expired token');
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.ResetLinkInvalid]);
  });

  it('should show error snackbar and navigate if statusCode is not 200 but result is true', () => {
    const credentials = {
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };
    component.resetForm.setValue(credentials);

    jest
      .spyOn(authService, 'resetPassword')
      .mockReturnValue(
        of({ result: true, statusCode: 500, message: 'Server responded with error', data: null }),
      );

    const errorSpy = jest.spyOn(snackbarService, 'showError');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.onSubmit();

    expect(errorSpy).toHaveBeenCalledWith('Error! 500', 'Server responded with error');
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });

  it('should show error snackbar and navigate if result is false even with statusCode 200', () => {
    const credentials = {
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };
    component.resetForm.setValue(credentials);

    jest
      .spyOn(authService, 'resetPassword')
      .mockReturnValue(
        of({ result: false, statusCode: 200, message: 'Unexpected failure', data: null }),
      );

    const errorSpy = jest.spyOn(snackbarService, 'showError');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.onSubmit();

    expect(errorSpy).toHaveBeenCalledWith('Error! 200', 'Unexpected failure');
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });
  it('should navigate to ResetLinkInvalid if no resetToken is present', () => {
    const activatedRoute = TestBed.inject(ActivatedRoute);
    const navigateSpy = jest.spyOn(router, 'navigate');

    // Override queryParamMap to return null
    activatedRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue(null);

    component.ngOnInit();

    expect(navigateSpy).toHaveBeenCalledWith([Navigations.ResetLinkInvalid]);
  });
  it('should show default error and navigate when verifyResetToken throws error without message', () => {
    jest.spyOn(authService, 'verifyResetToken').mockReturnValue(
      throwError(() => ({})), // no error.message
    );

    const errorSpy = jest.spyOn(snackbarService, 'showError');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.ngOnInit();

    expect(errorSpy).toHaveBeenCalledWith('Error', PlatformMessages.errorMessage);
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.ResetLinkInvalid]);
  });

  it('should show default success message if res.message is missing on successful reset', () => {
    const credentials = {
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };
    component.resetForm.setValue(credentials);

    jest
      .spyOn(authService, 'resetPassword')
      .mockReturnValue(of({ result: true, statusCode: 200, message: '', data: null }));

    const successSpy = jest.spyOn(snackbarService, 'showSuccess');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.onSubmit();

    expect(successSpy).toHaveBeenCalledWith('Success', PlatformMessages.passwordResetSuccess);
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.Login]);
  });

  it('should use default error message when verifyResetToken error has no message', () => {
    jest.spyOn(authService, 'verifyResetToken').mockReturnValue(
      throwError(() => ({ error: {} })), // no message inside error
    );

    const errorSpy = jest.spyOn(snackbarService, 'showError');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.ngOnInit();

    expect(errorSpy).toHaveBeenCalledWith('Error', PlatformMessages.errorMessage);
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.ResetLinkInvalid]);
  });

  it('should use default error message when resetPassword response has no message and fails', () => {
    const credentials = {
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };
    component.resetForm.setValue(credentials);

    jest.spyOn(authService, 'resetPassword').mockReturnValue(
      of({ result: false, statusCode: 400, message: '', data: null }), // message is null
    );

    const errorSpy = jest.spyOn(snackbarService, 'showError');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.onSubmit();

    expect(errorSpy).toHaveBeenCalledWith(
      `${PlatformMessages.errorTitle} 400`,
      PlatformMessages.errorMessage,
    );
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });

  it('should use default error message when resetPassword throws error without message', () => {
    const credentials = {
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };
    component.resetForm.setValue(credentials);

    jest.spyOn(authService, 'resetPassword').mockReturnValue(
      throwError(() => ({})), // no error object at all
    );

    const errorSpy = jest.spyOn(snackbarService, 'showError');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.onSubmit();

    expect(errorSpy).toHaveBeenCalledWith('Error', PlatformMessages.errorMessage);
    expect(navigateSpy).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });
});
