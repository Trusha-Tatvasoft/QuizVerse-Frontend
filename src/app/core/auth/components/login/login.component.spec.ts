import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { LoaderService } from '../../../../shared/service/loader/loader.service';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { provideRouter } from '@angular/router';
import { Validators } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loaderService: LoaderService;
  let validationErrorService: ValidationErrorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [LoaderService, ValidationErrorService, provideRouter([])],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    loaderService = TestBed.inject(LoaderService);
    validationErrorService = TestBed.inject(ValidationErrorService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with email and password fields', () => {
    const formValue = component.loginForm.value;
    expect(formValue).toHaveProperty('email');
    expect(formValue).toHaveProperty('password');
  });

  it('should mark all fields as touched and not proceed when form is invalid', () => {
    const markSpy = jest.spyOn(component.loginForm, 'markAllAsTouched');
    const showLoaderSpy = jest.spyOn(loaderService, 'show');

    component.onSubmit();

    expect(markSpy).toHaveBeenCalled();
    expect(showLoaderSpy).not.toHaveBeenCalled();
  });

  it('should show loader and hide after timeout when form is valid', () => {
    const showSpy = jest.spyOn(loaderService, 'show');
    const hideSpy = jest.spyOn(loaderService, 'hide');

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    jest.useFakeTimers();
    component.onSubmit();

    expect(showSpy).toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(hideSpy).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should return error message if control is invalid and touched', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValidators([Validators.required]);
    emailControl?.markAsTouched();
    emailControl?.setValue('');
    emailControl?.updateValueAndValidity();

    const mockMessage = 'Email is required.';
    jest.spyOn(validationErrorService, 'getErrorMessage').mockReturnValue(mockMessage);

    const error = component.getError('email');
    expect(error).toBe(mockMessage);
  });

  it('should return null from getError if control is valid', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('test@example.com');
    emailControl?.markAsTouched();
    emailControl?.updateValueAndValidity();

    jest.spyOn(validationErrorService, 'getErrorMessage').mockReturnValue(null);

    const error = component.getError('email');
    expect(error).toBeNull();
  });

  it('should return null if getError is called with unknown field', () => {
    jest.spyOn(validationErrorService, 'getErrorMessage').mockReturnValue(null);

    const result = component.getError('nonExistentField');
    expect(result).toBeNull();
  });

  it('should use SIGNIN_BUTTON_CONFIG label', () => {
    expect(component.signInButton.label).toBeDefined();
  });
});
