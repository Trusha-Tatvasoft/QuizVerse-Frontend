import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { provideRouter } from '@angular/router';
import { Validators } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let validationErrorService: ValidationErrorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [ValidationErrorService, provideRouter([])],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
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

    component.onSubmit();

    expect(markSpy).toHaveBeenCalled();
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

  it('should create credentials and not mark as touched when form is valid', () => {
    // Fill form with valid values
    component.loginForm.get('email')?.setValue('john@example.com');
    component.loginForm.get('password')?.setValue('StrongPass123');

    const markSpy = jest.spyOn(component.loginForm, 'markAllAsTouched');

    component.onSubmit();

    expect(component.loginForm.valid).toBe(true);
    expect(markSpy).not.toHaveBeenCalled();
  });
});
