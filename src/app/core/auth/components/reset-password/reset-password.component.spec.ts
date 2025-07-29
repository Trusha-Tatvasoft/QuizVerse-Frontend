import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { provideRouter } from '@angular/router';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { FormBuilder } from '@angular/forms';
import { ResetCredential } from '../../interfaces/forgot-reset-password.interface';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let validationErrorService: ValidationErrorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    validationErrorService = TestBed.inject(ValidationErrorService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with all controls', () => {
    const controls = component.resetForm.controls;
    expect(controls['password']).toBeDefined();
    expect(controls['confirmPassword']).toBeDefined();
  });

  it('should return correct field name from trackByField()', () => {
    const result = component.trackByField(0, { name: 'password' });
    expect(result).toBe('password');
  });

  it('should call getError() and return null if control is valid', () => {
    const control = component.resetForm.get('password');
    control?.setValue('Password@123');
    jest.spyOn(validationErrorService, 'getErrorMessage').mockReturnValue(null);

    const result = component.getError('password');
    expect(result).toBeNull();
    expect(validationErrorService.getErrorMessage).toHaveBeenCalled();
  });

  it('should apply password mismatch error when passwords do not match', () => {
    component.resetForm.get('password')?.setValue('Password@123');
    component.resetForm.get('confirmPassword')?.setValue('WrongPass');

    const result = component.passwordMatchValidator(component.resetForm);
    expect(component.resetForm.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);
    expect(result).toBeNull();
  });

  it('should clear passwordMismatch error when passwords match', () => {
    const control = component.resetForm.get('confirmPassword');
    control?.setErrors({ passwordMismatch: true });

    component.resetForm.get('password')?.setValue('MatchPass@1');
    control?.setValue('MatchPass@1');

    component.passwordMatchValidator(component.resetForm);

    expect(control?.hasError('passwordMismatch')).toBe(false);
  });

  it('should mark all as touched if form is invalid on submit', () => {
    const markSpy = jest.spyOn(component.resetForm, 'markAllAsTouched');

    component.onSubmit();

    expect(markSpy).toHaveBeenCalled();
  });

  it('should return null from validator if confirmPassword is missing', () => {
    component.resetForm.removeControl('confirmPassword');

    const result = component.passwordMatchValidator(component.resetForm);

    expect(result).toBeNull();
  });

  it('should return null if confirmPassword control is missing', () => {
    const formGroup = new FormBuilder().group({
      password: ['Test@123'],
      // no confirmPassword field
    });

    const result = component.passwordMatchValidator(formGroup);
    expect(result).toBeNull();
  });

  it('should set passwordMismatch error when passwords do not match', () => {
    const formGroup = new FormBuilder().group({
      password: ['Password123'],
      confirmPassword: ['Mismatch123'],
    });

    const result = component.passwordMatchValidator(formGroup);
    expect(formGroup.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);
    expect(result).toBeNull();
  });

  it('should not set passwordMismatch error when passwords match', () => {
    const formGroup = new FormBuilder().group({
      password: ['SamePassword1'],
      confirmPassword: ['SamePassword1'],
    });

    const result = component.passwordMatchValidator(formGroup);
    expect(formGroup.get('confirmPassword')?.hasError('passwordMismatch')).toBe(false);
    expect(result).toBeNull();
  });

  it('should fallback to empty object if validationMessages is undefined', () => {
    // Patch a field with no validationMessages
    const mockField = {
      name: 'password',
      validators: [],
    };
    component.resetFields = [mockField as any];

    const control = component.resetForm.get('password');
    control?.setValue('');

    jest.spyOn(validationErrorService, 'getErrorMessage').mockReturnValue('Mocked error');

    const result = component.getError('password');

    expect(result).toBe('Mocked error');
    expect(validationErrorService.getErrorMessage).toHaveBeenCalledWith(control, {}, 'password');
  });

  it('should create credentials and not mark as touched when form is valid', () => {
    const password = 'ValidPass@1';

    component.resetForm.get('password')?.setValue(password);
    component.resetForm.get('confirmPassword')?.setValue(password);

    const markSpy = jest.spyOn(component.resetForm, 'markAllAsTouched');

    component.onSubmit();

    const credentials: ResetCredential = {
      password,
      confirmPassword: password,
    };

    // Optional: you can spy on a service method here if you use it later
    expect(component.resetForm.valid).toBe(true);
    expect(markSpy).not.toHaveBeenCalled();
  });
});
