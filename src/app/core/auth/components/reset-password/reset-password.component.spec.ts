import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { provideRouter } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LoaderService } from '../../../../shared/service/loader/loader.service';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let loaderService: LoaderService;

  const loaderServiceMock = {
    show: jest.fn(),
    hide: jest.fn(),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, ReactiveFormsModule],
      providers: [provideRouter([]), { provide: LoaderService, useValue: loaderServiceMock }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    loaderService = TestBed.inject(LoaderService);
    jest.clearAllMocks();
    fixture.detectChanges();
  });

  // Should create component instance
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Should initialize form controls based on resetFields
  it('should initialize form with controls from resetFields', () => {
    component.resetFields.forEach((field) => {
      expect(component.resetForm.contains(field.name)).toBe(true);
    });
  });

  // Should set passwordMismatch error when passwords don't match
  it('should set passwordMismatch error on confirmPassword control when passwords do not match', () => {
    component.resetForm.setValue({
      password: 'Password1!',
      confirmPassword: 'Password2!',
    });

    component.passwordMatchValidator(component.resetForm);
    const confirmControl = component.resetForm.get('confirmPassword');
    expect(confirmControl?.hasError('passwordMismatch')).toBe(true);
  });

  // Should remove passwordMismatch error when passwords match
  it('should remove passwordMismatch error when passwords match', () => {
    component.resetForm.setValue({
      password: 'SamePassword123!',
      confirmPassword: 'SamePassword123!',
    });

    component.passwordMatchValidator(component.resetForm);
    const confirmControl = component.resetForm.get('confirmPassword');
    expect(confirmControl?.hasError('passwordMismatch')).toBe(false);
  });

  // Should not submit form if form is invalid
  it('should not submit form if invalid', () => {
    component.resetForm.setValue({
      password: '',
      confirmPassword: '',
    });

    component.onSubmit();
    expect(loaderService.show).not.toHaveBeenCalled();
    expect(loaderService.hide).not.toHaveBeenCalled();
  });

  // Should call loaderService show and hide on valid form submission
  it('should call loaderService show and hide on valid form submission', () => {
    jest.useFakeTimers();

    component.resetForm.setValue({
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
    });

    component.onSubmit();

    expect(loaderService.show).toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    expect(loaderService.hide).toHaveBeenCalled();

    jest.useRealTimers();
  });

  // Should update confirmPassword validity when password changes
  it('should update confirmPassword validity when password changes', () => {
    const confirmPasswordControl = component.resetForm.get('confirmPassword');
    const updateSpy = jest.spyOn(confirmPasswordControl!, 'updateValueAndValidity');

    const passwordControl = component.resetForm.get('password');
    passwordControl?.setValue('NewPassword123!');

    expect(updateSpy).toHaveBeenCalled();
  });

  // Should return field name for trackByField
  it('should return field name in trackByField', () => {
    const field = { name: 'testName' };
    expect(component.trackByField(0, field)).toBe('testName');
  });

  // Should return null if confirmPassword control is missing in group
  it('should return null if confirmPassword control is missing', () => {
    const fakeFormGroup = new FormGroup({
      password: new FormControl('test'),
    });

    const result = component.passwordMatchValidator(fakeFormGroup);
    expect(result).toBeNull();
  });

  // Should retain other errors when removing passwordMismatch error
  it('should retain other errors if passwordMismatch is removed', () => {
    component.resetForm.setValue({
      password: 'SamePass123!',
      confirmPassword: 'SamePass123!',
    });

    const confirmControl = component.resetForm.get('confirmPassword');
    confirmControl?.setErrors({
      passwordMismatch: true,
      customError: true,
    });

    component.passwordMatchValidator(component.resetForm);

    expect(confirmControl?.hasError('passwordMismatch')).toBe(false);
    expect(confirmControl?.hasError('customError')).toBe(true);
  });

  // Should not remove other errors when passwords match
  it('should do nothing if password matches and confirmPassword has no passwordMismatch error', () => {
    component.resetForm.setValue({
      password: 'Match123!',
      confirmPassword: 'Match123!',
    });

    const confirmControl = component.resetForm.get('confirmPassword');
    confirmControl?.setErrors({ someOtherError: true });

    component.passwordMatchValidator(component.resetForm);

    expect(confirmControl?.hasError('passwordMismatch')).toBe(false);
    expect(confirmControl?.hasError('someOtherError')).toBe(true);
  });
});
