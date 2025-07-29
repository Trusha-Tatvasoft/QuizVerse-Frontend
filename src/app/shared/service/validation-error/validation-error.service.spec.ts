import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { ValidationErrorService } from './validation-error.service';

describe('ValidationErrorService', () => {
  let service: ValidationErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null if control is null', () => {
    expect(service.getErrorMessage(null as any)).toBeNull();
  });

  it('should return null if control has no errors', () => {
    const control = new FormControl('valid');
    expect(service.getErrorMessage(control)).toBeNull();
  });

  it('should return null if control has errors but is not touched', () => {
    const control = new FormControl('', [Validators.required]);
    control.markAsUntouched();
    expect(service.getErrorMessage(control)).toBeNull();
  });

  it('should return default required error message', () => {
    const control = new FormControl('', [Validators.required]);
    control.markAsTouched();
    expect(service.getErrorMessage(control)).toBe('This field is required.');
  });

  it('should return default minlength message', () => {
    const control = new FormControl('a', [Validators.minLength(3)]);
    control.markAsTouched();
    expect(service.getErrorMessage(control)).toBe('Minimum length is 3.');
  });

  it('should return default maxlength message', () => {
    const control = new FormControl('abcdef', [Validators.maxLength(4)]);
    control.markAsTouched();
    expect(service.getErrorMessage(control)).toBe('Maximum length is 4.');
  });

  it('should return default email message', () => {
    const control = new FormControl('notanemail', [Validators.email]);
    control.markAsTouched();
    expect(service.getErrorMessage(control)).toBe('Invalid email address.');
  });

  it('should return default pattern message', () => {
    const control = new FormControl('abc', [Validators.pattern(/^\d+$/)]);
    control.markAsTouched();
    expect(service.getErrorMessage(control)).toBe('Invalid format.');
  });

  it('should return custom message if provided', () => {
    const control = new FormControl('', [Validators.required]);
    control.markAsTouched();
    const customMessages = {
      required: 'Custom required message.',
    };
    expect(service.getErrorMessage(control, customMessages)).toBe('Custom required message.');
  });

  it('should return default fallback message for unknown error key', () => {
    const control = new FormControl('');
    control.setErrors({ customError: true });
    control.markAsTouched();
    expect(service.getErrorMessage(control)).toBe('Invalid: customError');
  });

  it('should return space error for noSpaceFields like username', () => {
    const control = new FormControl('user name', [Validators.pattern(/^[a-zA-Z]+$/)]);
    control.markAsTouched();
    expect(service.getErrorMessage(control, {}, 'username')).toBe(
      'Username cannot contain spaces.',
    );
  });

  it('should return space error for noSpaceFields like password', () => {
    const control = new FormControl('pass word', [Validators.pattern(/^[a-zA-Z]+$/)]);
    control.markAsTouched();
    expect(service.getErrorMessage(control, {}, 'password')).toBe(
      'Password cannot contain spaces.',
    );
  });

  it('should not return space error for fields not in noSpaceFields', () => {
    const control = new FormControl('some value', [Validators.pattern(/^\d+$/)]);
    control.markAsTouched();
    expect(service.getErrorMessage(control, {}, 'address')).toBe('Invalid format.');
  });

  it('should return custom pattern message even if value contains space (non noSpaceFields)', () => {
    const control = new FormControl('abc def', [Validators.pattern(/^\d+$/)]);
    control.markAsTouched();
    const customMessages = { pattern: 'Custom pattern error.' };
    expect(service.getErrorMessage(control, customMessages, 'email')).toBe('Custom pattern error.');
  });

  it('should return capitalized field name in space error message', () => {
    const control = new FormControl('abc def', [Validators.pattern(/^[a-zA-Z]+$/)]);
    control.markAsTouched();
    expect(service.getErrorMessage(control, {}, 'password')).toBe(
      'Password cannot contain spaces.',
    );
  });

  it('should return custom passwordMismatch message if provided', () => {
    const control = new FormControl('');
    control.setErrors({ passwordMismatch: true });
    control.markAsTouched();
    const customMessages = { passwordMismatch: 'Custom mismatch error' };
    expect(service.getErrorMessage(control, customMessages)).toBe('Custom mismatch error');
  });

  it('should return default passwordMismatch message', () => {
    const control = new FormControl('');
    control.setErrors({ passwordMismatch: true });
    control.markAsTouched();
    expect(service.getErrorMessage(control)).toBe('Passwords do not match.');
  });

  it('should return null if errors object has no keys', () => {
    const control = new FormControl('');
    control.setErrors({});
    control.markAsTouched();

    expect(service.getErrorMessage(control)).toBeNull();
  });
});
