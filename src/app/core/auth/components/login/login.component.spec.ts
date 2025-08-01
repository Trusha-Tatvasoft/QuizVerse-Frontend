import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { of, throwError } from 'rxjs';
import { Navigations } from '../../../../shared/enums/navigation';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let validationErrorService: ValidationErrorService;
  let authSpy: jest.Mocked<AuthService>;
  let snackbarSpy: jest.Mocked<SnackbarService>;
  let router: Router;

  beforeEach(waitForAsync(() => {
    authSpy = {
      login: jest.fn(),
      getAccessToken: jest.fn(),
      getRoleFromToken: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    snackbarSpy = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        ValidationErrorService,
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: authSpy },
        { provide: SnackbarService, useValue: snackbarSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
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
    emailControl?.setValue('');
    emailControl?.markAsTouched();
    emailControl?.updateValueAndValidity();

    const mockMessage = 'Email is required';
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
    component.loginForm.setValue({
      email: 'john@example.com',
      password: 'StrongPass123',
      rememberMe: true,
    });

    authSpy.login.mockReturnValue(of(void 0));
    authSpy.getAccessToken.mockReturnValue('token');
    authSpy.getRoleFromToken.mockReturnValue('admin');

    const markSpy = jest.spyOn(component.loginForm, 'markAllAsTouched');
    const navSpy = jest.spyOn(TestBed.inject(Router), 'navigate');

    component.onSubmit();

    expect(component.loginForm.valid).toBe(true);
    expect(markSpy).not.toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith(['admin']); // or Navigations.Admin
  });

  it('should show success snackbar and navigate to /admin for admin login', () => {
    component.loginForm.setValue({
      email: 'admin@example.com',
      password: 'adminpass',
      rememberMe: true,
    });

    authSpy.login.mockReturnValue(of(void 0));
    authSpy.getAccessToken.mockReturnValue('token');
    authSpy.getRoleFromToken.mockReturnValue('admin');
    const navSpy = jest.spyOn(router, 'navigate');

    component.onSubmit();

    expect(snackbarSpy.showSuccess).toHaveBeenCalledWith(
      'Welcome back!',
      'You have been successfully logged in!',
    );
    expect(navSpy).toHaveBeenCalledWith([Navigations.Admin]);
  });

  it('should navigate to /user for player login', () => {
    component.loginForm.setValue({
      email: 'player@example.com',
      password: 'playerpass',
      rememberMe: false,
    });

    authSpy.login.mockReturnValue(of(void 0));
    authSpy.getAccessToken.mockReturnValue('token');
    authSpy.getRoleFromToken.mockReturnValue('player');
    const navSpy = jest.spyOn(router, 'navigate');

    component.onSubmit();

    expect(navSpy).toHaveBeenCalledWith([Navigations.User]);
  });

  it('should show error snackbar on login failure', () => {
    component.loginForm.setValue({
      email: 'wrong@example.com',
      password: 'wrongpass',
      rememberMe: false,
    });

    authSpy.login.mockReturnValue(throwError(() => new Error('Invalid login')));

    component.onSubmit();

    expect(snackbarSpy.showError).toHaveBeenCalledWith('Login Falied!!');
  });
});
