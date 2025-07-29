import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LoaderService } from '../../../../shared/service/loader/loader.service';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { Validators } from '@angular/forms';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let router: Router;
  let loaderService: LoaderService;
  let validationErrorService: ValidationErrorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [provideRouter([]), LoaderService, ValidationErrorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    loaderService = TestBed.inject(LoaderService);
    validationErrorService = TestBed.inject(ValidationErrorService);

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
    const loaderSpy = jest.spyOn(loaderService, 'show');

    component.onSubmit();

    expect(markSpy).toHaveBeenCalled();
    expect(loaderSpy).not.toHaveBeenCalled();
  });

  it('should call show, hide loader and navigate on valid form submit', () => {
    const showSpy = jest.spyOn(loaderService, 'show');
    const hideSpy = jest.spyOn(loaderService, 'hide');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.forgotPasswordForm.setValue({ email: 'test@example.com' });

    jest.useFakeTimers();
    component.onSubmit();

    expect(showSpy).toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(hideSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['reset-password-link-success'], {
      state: { email: 'test@example.com' },
    });
    jest.useRealTimers();
  });

  it('should not mark form as touched if valid and submitted', () => {
    const markSpy = jest.spyOn(component.forgotPasswordForm, 'markAllAsTouched');

    component.forgotPasswordForm.setValue({ email: 'valid@example.com' });
    component.onSubmit();

    expect(markSpy).not.toHaveBeenCalled();
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
    expect(component.sendResetLinkButton.label).toBeDefined();
  });
});
