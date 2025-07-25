import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, ReactiveFormsModule],
      providers: [provideRouter([])],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with controls from resetFields', () => {
    component.resetFields.forEach((field) => {
      expect(component.resetForm.contains(field.name)).toBe(true);
    });
  });

  it('should disable the button config when isLoading is true', () => {
    component.isLoading = true;
    expect(component.buttonConfig.isDisabled).toBe(true);
  });

  it('should enable the button config when isLoading is false', () => {
    component.isLoading = false;
    expect(component.buttonConfig.isDisabled).toBe(false);
  });

  it('should return passwordMismatch error when passwords do not match', () => {
    component.resetForm.setValue({
      password: 'Password1!',
      confirmPassword: 'Password2!',
    });
    const error = component.passwordMatchValidator(component.resetForm);
    expect(error).toEqual({ passwordMismatch: true });
  });

  it('should return null when passwords match', () => {
    component.resetForm.setValue({
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    const error = component.passwordMatchValidator(component.resetForm);
    expect(error).toBeNull();
  });

  it('should not submit form if invalid', () => {
    component.resetForm.setValue({
      password: '',
      confirmPassword: '',
    });
    component.onSubmit();
    expect(component.isLoading).toBe(false);
  });

  it('should toggle isLoading on valid form submission', () => {
    jest.useFakeTimers();

    component.resetForm.setValue({
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    });

    component.onSubmit();
    expect(component.isLoading).toBe(true);

    jest.advanceTimersByTime(1000);
    expect(component.isLoading).toBe(false);

    jest.useRealTimers();
  });

  it('should update confirmPassword validity when password changes', () => {
    const confirmPasswordControl = component.resetForm.get('confirmPassword');
    const updateSpy = jest.spyOn(confirmPasswordControl!, 'updateValueAndValidity');

    const passwordControl = component.resetForm.get('password');
    passwordControl?.setValue('NewPassword123!');

    expect(updateSpy).toHaveBeenCalled();
  });
});
