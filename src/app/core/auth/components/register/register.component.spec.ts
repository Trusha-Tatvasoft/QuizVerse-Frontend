import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
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
            checkUserNameExists: jest.fn(),
            checkEmailExists: jest.fn(),
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

  it('should emit FormData with all fields when creating user and form is valid', () => {
    component.isEditMode = false;
    component.saveUser.emit = jest.fn();

    component.userForm.setValue({
      fullName: 'Jane Doe',
      username: 'janedoe',
      email: 'jane@example.com',
      password: 'Password@123',
      bio: 'Test user',
      profilePicture: null,
    });

    expect(component.userForm.valid).toBe(true);

    component.createUserFormSubmit();

    expect(component.saveUser.emit).toHaveBeenCalledTimes(1);

    const emittedArg = (component.saveUser.emit as jest.Mock).mock.calls[0][0];
    const formData: FormData = emittedArg.formData;

    expect(formData.get('fullName')).toBe('Jane Doe');
    expect(formData.get('username')).toBe('janedoe');
    expect(formData.get('email')).toBe('jane@example.com');
    expect(emittedArg.isEdit).toBe(false);
  });

  it('should clear password fields and skip them in FormData when editing', () => {
    component.isEditMode = true;
    component.user = { id: 101 } as any;

    component.userForm.patchValue({
      fullName: 'Edited Name',
      username: 'editedusername',
      email: 'edited@example.com',
      password: 'shouldBeCleared',
      confirmPassword: 'shouldBeCleared',
      bio: '',
      profilePicture: null,
    });

    const emitSpy = jest.spyOn(component.saveUser, 'emit');

    component.createUserFormSubmit();

    expect(component.userForm.valid).toBe(true);
    expect(emitSpy).toHaveBeenCalledTimes(1);

    const emittedArg = emitSpy.mock.calls[0][0]!;
    const formData: FormData = emittedArg.formData;

    expect(formData.get('password')).toBeNull();
    expect(formData.get('confirmPassword')).toBeNull();
    expect(formData.get('fullName')).toBe('Edited Name');
    expect(formData.get('id')).toBe('101');
    expect(emittedArg.isEdit).toBe(true);

    expect(component.userForm.get('password')?.value).toBe('');
    expect(component.userForm.get('confirmPassword')?.value ?? '').toBe('');
  });

  it('should not emit when form is invalid', () => {
    const emitSpy = jest.spyOn(component.saveUser, 'emit');

    component.userForm.get('email')?.setValue('');

    component.userForm.get('fullName')?.setValue('Valid Name');
    component.userForm.get('username')?.setValue('validusername');
    component.userForm.get('password')?.setValue('ValidPass123!');
    component.userForm.get('confirmPassword')?.setValue('ValidPass123!');

    component.createUserFormSubmit();

    expect(component.userForm.invalid).toBe(true);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should skip appending empty or null values to FormData', () => {
    const emitSpy = jest.spyOn(component.saveUser, 'emit');

    component.userForm.patchValue({
      fullName: 'John Doe',
      email: 'john@example.com',
      username: 'john_doe',
      password: 'John@9090',
      confirmPassword: 'John@9090',
      bio: '',
    });

    component.createUserFormSubmit();

    expect(emitSpy).toHaveBeenCalledTimes(1);

    const emittedArg = emitSpy.mock.calls[0][0]!;
    const formData: FormData = emittedArg.formData;

    expect(formData.has('bio')).toBe(false);

    expect(formData.get('fullName')).toBe('John Doe');
    expect(formData.get('email')).toBe('john@example.com');
    expect(formData.get('username')).toBe('john_doe');
  });

  it('should emit formCancelled event when cancel is called', () => {
    const cancelSpy = jest.spyOn(component.formCancelled, 'emit');

    component.cancel();

    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it('should append selectedFile as profilePic to FormData when selectedFile is set', () => {
    const mockFile = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    component.selectedFile = mockFile;

    component.userForm.patchValue({
      fullName: 'John Doe',
      email: 'john@example.com',
      username: 'john_doe',
      password: 'John@123',
      confirmPassword: 'John@123',
      bio: 'Test bio',
    });

    const emitSpy = jest.spyOn(component.saveUser, 'emit');

    component.createUserFormSubmit();

    expect(emitSpy).toHaveBeenCalledTimes(1);

    const emittedArg = emitSpy.mock.calls[0][0]!;
    const formData: FormData = emittedArg.formData;

    expect(formData.get('profilePic')).toBeInstanceOf(File);
    expect((formData.get('profilePic') as File).name).toBe('avatar.png');
  });

  describe('getActiveForm', () => {
    it('should return userForm when isLogin = true', () => {
      component.isLogin = true;
      expect(component['getActiveForm']()).toBe(component.userForm);
    });

    it('should return registerForm when isLogin = false', () => {
      component.isLogin = false;
      expect(component['getActiveForm']()).toBe(component.registerForm);
    });
  });

  describe('validateUserName', () => {
    beforeEach(() => {
      component.isLogin = false;
      component.isEditMode = false;
    });

    it('should not call service if username is empty', () => {
      const control = component.registerForm.get('username');
      control?.setValue('');

      component.validateUserName();

      expect(registerService.checkUserNameExists).not.toHaveBeenCalled();
    });

    it('should not call service if control is invalid', () => {
      const control = component.registerForm.get('username');
      control?.setValue('testUser');
      control?.setErrors({ required: true });

      component.validateUserName();

      expect(registerService.checkUserNameExists).not.toHaveBeenCalled();
    });

    it('should call checkUserNameExists and clear server error on success (new user)', fakeAsync(() => {
      const control = component.registerForm.get('username');
      control?.setValue('testUser');
      control?.setErrors({ server: 'Some error' });
      control?.setErrors(null);

      (registerService.checkUserNameExists as jest.Mock).mockReturnValue(of({}));

      component.validateUserName();
      tick();

      expect(registerService.checkUserNameExists).toHaveBeenCalledWith('testUser', undefined);
      expect(control?.hasError('server')).toBeFalsy();
    }));

    it('should call checkUserNameExists with user id when editing', fakeAsync(() => {
      component.isEditMode = true;
      component.user = { id: 1 } as any;

      const control = component.registerForm.get('username');
      control?.setValue('testUser');

      (registerService.checkUserNameExists as jest.Mock).mockReturnValue(of({}));

      component.validateUserName();
      tick();

      expect(registerService.checkUserNameExists).toHaveBeenCalledWith('testUser', 1);
    }));

    it('should set server error if service returns 400', fakeAsync(() => {
      const control = component.registerForm.get('username');
      control?.setValue('testUser');

      (registerService.checkUserNameExists as jest.Mock).mockReturnValue(
        throwError(() => ({
          status: 400,
          error: { message: 'Username already exists' },
        })),
      );

      component.validateUserName();
      tick();

      expect(control?.hasError('server')).toBeTruthy();
      expect(control?.touched).toBe(true);
    }));

    it('should show snackbar error if service returns 500', fakeAsync(() => {
      const control = component.registerForm.get('username');
      control?.setValue('testUser');

      (registerService.checkUserNameExists as jest.Mock).mockReturnValue(
        throwError(() => ({
          status: 500,
          error: { message: 'Internal Server Error' },
        })),
      );

      component.validateUserName();
      tick();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        'Internal Server Error',
      );
    }));

    it('should clear existing server error on success response', fakeAsync(() => {
      component.isLogin = false;
      component.isEditMode = false;

      const control = component.registerForm.get('username');
      control?.setValue('testUser');
      control?.setErrors({ server: 'Some error' });

      control?.markAsTouched();
      control?.updateValueAndValidity();

      (registerService.checkUserNameExists as jest.Mock).mockReturnValue(of({}));

      component.validateUserName();
      tick();

      expect(registerService.checkUserNameExists).toHaveBeenCalledWith('testUser', undefined);

      expect(control?.hasError('server')).toBeFalsy();
    }));
  });

  describe('validateEmail', () => {
    beforeEach(() => {
      component.isLogin = false;
      component.isEditMode = false;
    });

    it('should not call checkEmailExists if control is invalid', () => {
      const control = component.registerForm.get('email');
      control?.setValue('invalidEmail');
      control?.setErrors({ required: true });

      component.validateEmail();

      expect(registerService.checkEmailExists).not.toHaveBeenCalled();
    });

    it('should not call checkEmailExists if no value is entered', () => {
      const control = component.registerForm.get('email');
      control?.setValue('');

      component.validateEmail();

      expect(registerService.checkEmailExists).not.toHaveBeenCalled();
    });

    it('should not call checkEmailExists in edit mode', () => {
      component.isEditMode = true;
      const control = component.registerForm.get('email');
      control?.setValue('test@example.com');

      component.validateEmail();

      expect(registerService.checkEmailExists).not.toHaveBeenCalled();
    });

    it('should call checkEmailExists when adding a new user with valid email', fakeAsync(() => {
      const control = component.registerForm.get('email');
      control?.setValue('test@example.com');
      control?.setErrors(null);

      (registerService.checkEmailExists as jest.Mock).mockReturnValue(of({}));

      component.validateEmail();
      tick();

      expect(registerService.checkEmailExists).toHaveBeenCalledWith('test@example.com');
    }));

    it('should clear existing server error on success response', fakeAsync(() => {
      component.isLogin = false;
      component.isEditMode = false;

      const control = component.registerForm.get('email');
      control?.setValue('test@example.com');
      control?.setErrors({ server: 'Some error' });
      control?.markAsTouched();
      control?.updateValueAndValidity();

      (registerService.checkEmailExists as jest.Mock).mockReturnValue(of({}));

      component.validateEmail();
      tick();

      expect(registerService.checkEmailExists).toHaveBeenCalledWith('test@example.com');
      expect(control?.hasError('server')).toBeFalsy();
    }));

    it('should set server error and mark control as touched for 4xx errors', fakeAsync(() => {
      const control = component.registerForm.get('email');
      control?.setValue('test@example.com');

      (registerService.checkEmailExists as jest.Mock).mockReturnValue(
        throwError(() => ({ status: 409, error: { message: 'Email already exists' } })),
      );

      component.validateEmail();
      tick();

      expect(control?.hasError('server')).toBeTruthy();
      expect(control?.touched).toBeTruthy();
    }));

    it('should show snackbar error for 5xx errors', fakeAsync(() => {
      const control = component.registerForm.get('email');
      control?.setValue('test@example.com');

      (registerService.checkEmailExists as jest.Mock).mockReturnValue(
        throwError(() => ({ status: 500, error: { message: 'Internal error' } })),
      );

      component.validateEmail();
      tick();

      expect(snackbarService.showError).toHaveBeenCalledWith(
        `${platformMessages.errorTitle} 500`,
        'Internal error',
      );
    }));
  });
});
