import { ValidationErrorService } from './validation-error.service';
import { FormControl, Validators } from '@angular/forms';

describe('ValidationErrorService', () => {
  let service: ValidationErrorService;

  beforeEach(() => {
    service = new ValidationErrorService();
  });

  it('should return null if control is null or undefined', () => {
    expect(service.getError(null as any)).toBeNull();
  });

  it('should return null if control has no errors', () => {
    const control = new FormControl('valid');
    expect(service.getError(control)).toBeNull();
  });

  it('should return null if control is invalid but not touched', () => {
    const control = new FormControl('', [Validators.required]);
    expect(service.getError(control)).toBeNull(); // not touched yet
  });

  it('should return default required error', () => {
    const control = new FormControl('', [Validators.required]);
    control.markAsTouched();
    expect(service.getError(control)).toBe('This field is required.');
  });

  it('should return default minlength error', () => {
    const control = new FormControl('ab', [Validators.minLength(5)]);
    control.markAsTouched();
    expect(service.getError(control)).toBe('Minimum length is 5.');
  });

  it('should return default maxlength error', () => {
    const control = new FormControl('abcdef', [Validators.maxLength(3)]);
    control.markAsTouched();
    expect(service.getError(control)).toBe('Maximum length is 3.');
  });

  it('should return default email error', () => {
    const control = new FormControl('invalid-email', [Validators.email]);
    control.markAsTouched();
    expect(service.getError(control)).toBe('Invalid email address.');
  });

  it('should return default pattern error', () => {
    const control = new FormControl('123', [Validators.pattern('[a-zA-Z]*')]);
    control.markAsTouched();
    expect(service.getError(control)).toBe('Invalid format.');
  });

  it('should return custom error message if provided', () => {
    const control = new FormControl('', [Validators.required]);
    control.markAsTouched();
    const custom = { required: 'Custom required error' };
    expect(service.getError(control, custom)).toBe('Custom required error');
  });

  it('should return "Invalid: key" if unknown error type', () => {
    const control = new FormControl('');
    control.setErrors({ unknownError: true });
    control.markAsTouched();
    expect(service.getError(control)).toBe('Invalid: unknownError');
  });
});
