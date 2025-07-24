import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { Router } from '@angular/router';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let routerMock: { navigate: jest.Mock };

  // Configure the testing module and mock dependencies
  beforeEach(waitForAsync(() => {
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();
  }));

  // Create component instance before each test
  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Ensure the component is created successfully
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Check if form initializes with controls from resetFields
  it('should initialize the form with controls from resetFields', () => {
    component.resetFields.forEach((field) => {
      expect(component.resetForm.contains(field.name)).toBe(true);
    });
  });

  // Ensure all password fields start as hidden
  it('should initialize password fields as hidden in hidePasswordMap', () => {
    const passwordFields = component.resetFields.filter((f) => f.type === 'password');
    passwordFields.forEach((field) => {
      expect(component.hidePasswordMap[field.name]).toBe(true);
    });
  });

  // Confirm button is disabled when loading
  it('buttonConfig should be disabled when isLoading is true', () => {
    component.isLoading = true;
    expect(component.buttonConfig.isDisabled).toBe(true);
  });

  // Confirm button is enabled when not loading
  it('buttonConfig should not be disabled when isLoading is false', () => {
    component.isLoading = false;
    expect(component.buttonConfig.isDisabled).toBe(false);
  });

  // Validate mismatch returns error
  it('should return passwordMismatch error when passwords do not match', () => {
    component.resetForm.setValue({
      password: 'password1',
      confirmPassword: 'password2',
    });

    const error = component.passwordMatchValidator(component.resetForm);
    expect(error).toEqual({ passwordMismatch: true });
  });

  // Validate match returns null
  it('should return null when passwords match', () => {
    component.resetForm.setValue({
      password: 'samePassword',
      confirmPassword: 'samePassword',
    });

    const error = component.passwordMatchValidator(component.resetForm);
    expect(error).toBeNull();
  });

  // Check password visibility toggle updates state
  it('should toggle password visibility for a given field', () => {
    const fieldName = component.resetFields.find((f) => f.type === 'password')?.name!;
    const initial = component.hidePasswordMap[fieldName];
    component.togglePasswordVisibility(fieldName);
    expect(component.hidePasswordMap[fieldName]).toBe(!initial);
  });

  // Ensure form is not submitted if invalid
  it('should not submit form if invalid', () => {
    component.resetForm.setValue({
      password: '',
      confirmPassword: '',
    });
    component.onSubmit();
    expect(component.isLoading).toBe(false);
  });

  // Simulate valid submission: isLoading should toggle
  it('should set isLoading true then false on valid form submission', async () => {
    component.resetForm.setValue({
      password: 'ValidPass123!',
      confirmPassword: 'ValidPass123!',
    });

    jest.useFakeTimers();

    component.onSubmit();
    expect(component.isLoading).toBe(true);

    jest.advanceTimersByTime(1000);
    expect(component.isLoading).toBe(false);

    jest.useRealTimers();
  });
});
