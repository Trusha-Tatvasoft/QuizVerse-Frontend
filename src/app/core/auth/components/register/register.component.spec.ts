import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { provideRouter } from '@angular/router';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { RegisterCredentials } from '../../interfaces/register.interface';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let validationErrorService: ValidationErrorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), ValidationErrorService],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
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

    component.onSubmit();

    expect(markSpy).toHaveBeenCalled();
  });

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

  it('should create credentials and not mark as touched when form is valid', () => {
    component.registerForm.get('fullName')?.setValue('John Doe');
    component.registerForm.get('email')?.setValue('john@example.com');
    component.registerForm.get('password')?.setValue('StrongPass@123');
    component.registerForm.get('username')?.setValue('johndoe');

    Object.entries(component.registerForm.controls).forEach(([key, control]) => {
      expect(control.valid).toBe(true);
    });

    const markSpy = jest.spyOn(component.registerForm, 'markAllAsTouched');

    component.onSubmit();

    expect(component.registerForm.valid).toBe(true);
    expect(markSpy).not.toHaveBeenCalled();
  });
});
