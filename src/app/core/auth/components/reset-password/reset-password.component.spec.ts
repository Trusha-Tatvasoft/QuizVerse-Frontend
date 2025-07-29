import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { provideRouter } from '@angular/router';
import { LoaderService } from '../../../../shared/service/loader/loader.service';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { FormBuilder } from '@angular/forms';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let loaderService: LoaderService;
  let validationErrorService: ValidationErrorService;

  beforeEach(async () => {
    const formBuilder = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    loaderService = TestBed.inject(LoaderService);
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
    const loaderSpy = jest.spyOn(loaderService, 'show');

    component.onSubmit();

    expect(markSpy).toHaveBeenCalled();
    expect(loaderSpy).not.toHaveBeenCalled();
  });

  it('should show and hide loader when form is valid on submit', fakeAsync(() => {
    const showSpy = jest.spyOn(loaderService, 'show');
    const hideSpy = jest.spyOn(loaderService, 'hide');

    component.resetForm.setValue({
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });

    component.onSubmit();
    expect(showSpy).toHaveBeenCalled();

    tick(1000);
    expect(hideSpy).toHaveBeenCalled();
  }));

  it('should update confirmPassword validity when password changes', () => {
    const confirmControl = component.resetForm.get('confirmPassword');
    const updateSpy = jest.spyOn(confirmControl!, 'updateValueAndValidity');

    component.resetForm.get('password')?.setValue('NewPass123');
    fixture.detectChanges();
    expect(updateSpy).toHaveBeenCalled();
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

  it('should clear passwordMismatch when passwords now match but error exists', () => {
    const formGroup = new FormBuilder().group({
      password: ['SamePassword1'],
      confirmPassword: ['SamePassword1'],
    });

    // simulate existing mismatch error
    formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });

    const result = component.passwordMatchValidator(formGroup);
    expect(formGroup.get('confirmPassword')?.errors).toBeNull();
    expect(result).toBeNull();
  });

  it('should retain other existing errors when passwordMismatch is removed', () => {
    const formGroup = new FormBuilder().group({
      password: ['SamePassword1'],
      confirmPassword: ['SamePassword1'],
    });

    // simulate existing multiple errors
    formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true, required: true });

    const result = component.passwordMatchValidator(formGroup);

    const errors = formGroup.get('confirmPassword')?.errors;
    expect(errors).toEqual({ required: true });
    expect(result).toBeNull();
  });

  it('should preserve all errors if passwords mismatch and other errors exist', () => {
    const formGroup = new FormBuilder().group({
      password: ['Pass1'],
      confirmPassword: ['WrongPass'],
    });

    // simulate existing unrelated error
    formGroup.get('confirmPassword')?.setErrors({ required: true });

    const result = component.passwordMatchValidator(formGroup);

    const errors = formGroup.get('confirmPassword')?.errors;
    expect(errors).toEqual({ required: true, passwordMismatch: true });
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
});
