import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { provideRouter } from '@angular/router';
import { LoaderService } from '../../../../shared/service/loader/loader.service';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let loaderService: LoaderService;
  let validationErrorService: ValidationErrorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), LoaderService, ValidationErrorService],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    loaderService = TestBed.inject(LoaderService);
    validationErrorService = TestBed.inject(ValidationErrorService);
    fixture.detectChanges();
  });

  // Component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Invalid form should mark as touched
  it('should mark form as touched if invalid on submit', () => {
    const markSpy = jest.spyOn(component.registerForm, 'markAllAsTouched');
    const loaderSpy = jest.spyOn(loaderService, 'show');

    component.onSubmit();

    expect(markSpy).toHaveBeenCalled();
    expect(loaderSpy).not.toHaveBeenCalled();
  });

  // Valid form should show and hide loader
  it('should call loader service on valid submit', fakeAsync(() => {
    const showSpy = jest.spyOn(loaderService, 'show');
    const hideSpy = jest.spyOn(loaderService, 'hide');

    component.registerForm.setValue({
      fullName: 'New User',
      email: 'new@example.com',
      username: 'newuser123',
      password: 'Password@123',
    });

    component.onSubmit();

    expect(showSpy).toHaveBeenCalled();
    tick(1000);
    expect(hideSpy).toHaveBeenCalled();
    expect(component.registerForm.value).toEqual({
      fullName: 'New User',
      email: 'new@example.com',
      username: 'newuser123',
      password: 'Password@123',
    });
  }));

  // Form field existence
  it('should initialize form fields correctly', () => {
    const controls = component.registerForm.controls;
    expect(controls['fullName']).toBeDefined();
    expect(controls['email']).toBeDefined();
    expect(controls['password']).toBeDefined();
    expect(controls['username']).toBeDefined();
  });

  // Config value check
  it('should display the correct register button label', () => {
    expect(component.registerButton.label).toBe('Create An Account');
  });

  // getError should call validationErrorService with proper args
  it('should return validation error from getError', () => {
    const fieldName = 'email';
    const mockMessage = 'Email is required.';
    const control = component.registerForm.get(fieldName);
    control?.markAsTouched();
    control?.setErrors({ required: true });

    const spy = jest.spyOn(validationErrorService, 'getErrorMessage').mockReturnValue(mockMessage);

    const result = component.getError(fieldName);
    expect(spy).toHaveBeenCalledWith(control, expect.any(Object), fieldName);
    expect(result).toBe(mockMessage);
  });

  // getError should return null if control not found
  it('should return null if getError called with unknown field', () => {
    const result = component.getError('nonexistentField');
    expect(result).toBeNull();
  });
});
