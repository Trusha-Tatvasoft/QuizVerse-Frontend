import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { ForgotResetPasswordService } from '../../services/forgot-reset-password.service';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PlatformMessages } from '../../../../utils/constants';
import { SEND_RESET_LINK_CONFIG } from '../../configs/forgot-password.component.config';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let validationErrorService: ValidationErrorService;
  let forgotResetPasswordService: ForgotResetPasswordService;
  let snackbarService: SnackbarService;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule],
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
            sendResetLink: jest.fn(),
          },
        },
        {
          provide: SnackbarService,
          useValue: {
            showSuccess: jest.fn(),
            showError: jest.fn(),
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    validationErrorService = TestBed.inject(ValidationErrorService);
    forgotResetPasswordService = TestBed.inject(ForgotResetPasswordService);
    snackbarService = TestBed.inject(SnackbarService);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with email control', () => {
    expect(component.forgotPasswordForm.contains('email')).toBe(true);
  });

  it('should mark form as touched and return early if form is invalid', () => {
    const markSpy = jest.spyOn(component.forgotPasswordForm, 'markAllAsTouched');

    component.onSubmit();

    expect(markSpy).toHaveBeenCalled();
  });

  it('should call sendResetLink and show success snackbar and navigate if form is valid', () => {
    const credentials = { email: 'test@example.com' };
    const sendResetLinkSpy = jest
      .spyOn(forgotResetPasswordService, 'sendResetLink')
      .mockReturnValue(of({ result: true, statusCode: 200, message: 'Success', data: null }));

    const navigateSpy = jest.spyOn(router, 'navigate');
    const showSuccessSpy = jest.spyOn(snackbarService, 'showSuccess');

    component.forgotPasswordForm.setValue(credentials);
    component.onSubmit();

    expect(sendResetLinkSpy).toHaveBeenCalledWith(credentials);
    expect(showSuccessSpy).toHaveBeenCalledWith('Success', 'Success');
    expect(navigateSpy).toHaveBeenCalledWith(['reset-password-link-success'], {
      state: { email: credentials.email },
    });
  });

  it('should show error snackbar if sendResetLink fails with non-200 code', () => {
    const credentials = { email: 'test@example.com' };
    jest
      .spyOn(forgotResetPasswordService, 'sendResetLink')
      .mockReturnValue(
        of({ result: false, statusCode: 400, message: 'Invalid email', data: null }),
      );

    const showErrorSpy = jest.spyOn(snackbarService, 'showError');

    component.forgotPasswordForm.setValue(credentials);
    component.onSubmit();

    expect(showErrorSpy).toHaveBeenCalledWith(
      `${PlatformMessages.errorTitle} 400`,
      'Invalid email',
    );
  });

  it('should show error snackbar on HTTP error', () => {
    const credentials = { email: 'test@example.com' };
    jest.spyOn(forgotResetPasswordService, 'sendResetLink').mockReturnValue(
      throwError(() => ({
        error: { message: 'Server error' },
      })),
    );

    const showErrorSpy = jest.spyOn(snackbarService, 'showError');

    component.forgotPasswordForm.setValue(credentials);
    component.onSubmit();

    expect(showErrorSpy).toHaveBeenCalledWith('Error', 'Server error');
  });

  it('should return error message if control is invalid and touched', () => {
    const emailControl = component.forgotPasswordForm.get('email');
    emailControl?.setValidators([Validators.required]);
    emailControl?.markAsTouched();
    emailControl?.setValue('');
    emailControl?.updateValueAndValidity();

    jest.spyOn(validationErrorService, 'getErrorMessage').mockReturnValue('Email is required.');

    const error = component.getError('email');
    expect(error).toBe('Email is required.');
  });

  it('should return null from getError if control is valid', () => {
    const emailControl = component.forgotPasswordForm.get('email');
    emailControl?.setValidators([Validators.required]);
    emailControl?.setValue('valid@example.com');
    emailControl?.markAsTouched();
    emailControl?.updateValueAndValidity();

    jest.spyOn(validationErrorService, 'getErrorMessage').mockReturnValue(null);

    const error = component.getError('email');
    expect(error).toBeNull();
  });

  it('should return null from getError if field not found', () => {
    jest.spyOn(validationErrorService, 'getErrorMessage').mockReturnValue(null);
    const error = component.getError('nonExistentField');
    expect(error).toBeNull();
  });

  it('should use SEND_RESET_LINK_CONFIG for button label', () => {
    expect(component.sendResetLinkButton.label).toBe(SEND_RESET_LINK_CONFIG.label);
  });

  it('should show error snackbar if result is false even with statusCode 200', () => {
    const credentials = { email: 'test@example.com' };
    jest
      .spyOn(forgotResetPasswordService, 'sendResetLink')
      .mockReturnValue(
        of({ result: false, statusCode: 200, message: 'Something went wrong', data: null }),
      );

    const showErrorSpy = jest.spyOn(snackbarService, 'showError');

    component.forgotPasswordForm.setValue(credentials);
    component.onSubmit();

    expect(showErrorSpy).toHaveBeenCalledWith(
      `${PlatformMessages.errorTitle} 200`,
      'Something went wrong',
    );
  });

  it('should fallback to default success message when res.message is missing', () => {
    const credentials = { email: 'test@example.com' };
    jest
      .spyOn(forgotResetPasswordService, 'sendResetLink')
      .mockReturnValue(of({ result: true, statusCode: 200, message: '', data: null }));

    const showSuccessSpy = jest.spyOn(snackbarService, 'showSuccess');

    component.forgotPasswordForm.setValue(credentials);
    component.onSubmit();

    expect(showSuccessSpy).toHaveBeenCalledWith(
      'Success',
      PlatformMessages.resetLinkSendSuccessfully,
    );
  });

  it('should fallback to default error message when HTTP error has no message', () => {
    const credentials = { email: 'test@example.com' };
    jest.spyOn(forgotResetPasswordService, 'sendResetLink').mockReturnValue(throwError(() => ({})));

    const showErrorSpy = jest.spyOn(snackbarService, 'showError');

    component.forgotPasswordForm.setValue(credentials);
    component.onSubmit();

    expect(showErrorSpy).toHaveBeenCalledWith('Error', PlatformMessages.errorMessage);
  });
});
