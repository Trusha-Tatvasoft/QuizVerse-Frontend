import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { RegisterService } from '../../services/register.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../utils/constants';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let registerService: RegisterService;
  let snackbarService: SnackbarService;
  let validationErrorService: ValidationErrorService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        {
          provide: ValidationErrorService,
          useValue: {
            getErrorMessage: jest.fn().mockReturnValue('Some error'),
          },
        },
        {
          provide: RegisterService,
          useValue: {
            registerUser: jest.fn(),
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
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    registerService = TestBed.inject(RegisterService);
    snackbarService = TestBed.inject(SnackbarService);
    validationErrorService = TestBed.inject(ValidationErrorService);
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize register form with fields', () => {
    component.registerFields.forEach((field) => {
      expect(component.registerForm.contains(field.name)).toBe(true);
    });
  });

  it('should return error from getError()', () => {
    const result = component.getError('fullName');
    expect(result).toBe('Some error');
  });

  it('should validate password mismatch', () => {
    const form = component.registerForm;
    form.get('password')?.setValue('Pass123!');
    form.get('confirmPassword')?.setValue('Pass456!');

    component.passwordMatchValidator(form);
    expect(form.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);
  });

  it('should clear mismatch error if passwords match', () => {
    const form = component.registerForm;
    form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    form.get('password')?.setValue('Pass123!');
    form.get('confirmPassword')?.setValue('Pass123!');

    component.passwordMatchValidator(form);
    expect(form.get('confirmPassword')?.errors).toBeNull();
  });

  it('should validate file type and size correctly', () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB

    const event = {
      target: { files: [mockFile] },
    } as unknown as Event;

    component.onFileSelected(event);
    expect(component.selectedFile).toBe(mockFile);
  });

  it('should reject large file (>10MB)', () => {
    const mockFile = new File([''], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockFile, 'size', { value: 11 * 1024 * 1024 });

    const event = {
      target: { files: [mockFile] },
    } as unknown as Event;

    component.onFileSelected(event);
    expect(component.selectedFile).toBeNull();
    expect(component.userForm.get('profilePicture')?.hasError('fileSize')).toBe(true);
  });

  it('should reject invalid file type', () => {
    const mockFile = new File([''], 'invalid.pdf', { type: 'application/pdf' });

    const event = {
      target: { files: [mockFile] },
    } as unknown as Event;

    component.onFileSelected(event);
    expect(component.selectedFile).toBeNull();
    expect(component.userForm.get('profilePicture')?.hasError('fileType')).toBe(true);
  });

  it('should call registerUser and show success snackbar', () => {
    component.registerForm.setValue({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      bio: '',
    });

    jest.spyOn(registerService, 'registerUser').mockReturnValue(
      of({
        result: true,
        statusCode: 201,
        message: 'Registered',
        data: null,
      }),
    );

    const successSpy = jest.spyOn(snackbarService, 'showSuccess');

    component.registerFormSubmit();

    expect(registerService.registerUser).toHaveBeenCalled();
    expect(successSpy).toHaveBeenCalledWith('Success', 'Registered');
  });

  it('should handle registration error response', () => {
    component.registerForm.setValue({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      bio: '',
    });

    jest.spyOn(registerService, 'registerUser').mockReturnValue(
      of({
        result: false,
        statusCode: 400,
        message: 'Registration failed',
        data: null,
      }),
    );

    const errorSpy = jest.spyOn(snackbarService, 'showError');

    component.registerFormSubmit();

    expect(errorSpy).toHaveBeenCalledWith('Error! 400', 'Registration failed');
  });

  it('should handle registration HTTP error', () => {
    component.registerForm.setValue({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      bio: '',
    });

    jest
      .spyOn(registerService, 'registerUser')
      .mockReturnValue(throwError(() => ({ error: { message: 'Server error' } })));

    const errorSpy = jest.spyOn(snackbarService, 'showError');

    component.registerFormSubmit();

    expect(errorSpy).toHaveBeenCalledWith('Error', 'Server error');
  });

  it('should call createUserFormSubmit if isLogin is true', () => {
    component.isLogin = true;
    const spy = jest.spyOn(component, 'createUserFormSubmit');
    component.onSubmit();
    expect(spy).toHaveBeenCalled();
  });

  it('should call registerFormSubmit if isLogin is false', () => {
    component.isLogin = false;
    const spy = jest.spyOn(component, 'registerFormSubmit');
    component.onSubmit();
    expect(spy).toHaveBeenCalled();
  });
  it('should handle getError when field is not found', () => {
    const error = component.getError('nonExistentField');
    expect(error).toBe('Some error');
  });

  it('should return error even if field has no validationMessages', () => {
    component.registerFields.push({ name: 'noValidation', type: 'text' } as any);

    const error = component.getError('noValidation');
    expect(error).toBe('Some error');
    component.registerFields.pop();
  });

  it('should return error when field is not found at all', () => {
    const error = component.getError('notFoundField');
    expect(error).toBe('Some error');
  });

  it('should treat non-201 with success result as error', () => {
    component.registerForm.setValue({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      bio: '',
    });

    jest.spyOn(registerService, 'registerUser').mockReturnValue(
      of({
        result: true,
        statusCode: 200, // non-201
        message: 'Weird success',
        data: null,
      }),
    );

    const errorSpy = jest.spyOn(snackbarService, 'showError');

    component.registerFormSubmit();

    expect(errorSpy).toHaveBeenCalledWith('Error! 200', 'Weird success');
  });

  it('should fallback to default message when success response has no message', () => {
    component.registerForm.setValue({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      bio: '',
    });

    jest.spyOn(registerService, 'registerUser').mockReturnValue(
      of({
        result: true,
        statusCode: 201,
        message: '', // message missing
        data: null,
      }),
    );

    const successSpy = jest.spyOn(snackbarService, 'showSuccess');

    component.registerFormSubmit();

    expect(successSpy).toHaveBeenCalledWith('Success', platformMessages.registerSuccessfully);
  });
});
