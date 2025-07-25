import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ValidationMessageMap } from '../../interfaces/validation-message-map.interface';
import { DefaultValidationMessageMap } from '../../interfaces/default-validation-message-map.interface';

@Injectable({ providedIn: 'root' })
export class ValidationErrorService {
  private readonly defaultMessages: DefaultValidationMessageMap = {
    required: () => 'This field is required.',
    minlength: (error) => `Minimum length is ${error.requiredLength}.`,
    maxlength: (error) => `Maximum length is ${error.requiredLength}.`,
    email: () => 'Invalid email address.',
    pattern: () => 'Invalid format.',
  };

  getError(control: AbstractControl, customMessages: ValidationMessageMap = {}): string | null {
    if (!control || !control.errors || !control.touched) return null;

    const errors: ValidationErrors = control.errors;

    for (const key of Object.keys(errors)) {
      // Priority: Custom message > Default message > Raw key
      if (customMessages[key]) {
        return customMessages[key];
      }
      if (this.defaultMessages[key]) {
        return this.defaultMessages[key](errors[key]);
      }
      return `Invalid: ${key}`;
    }

    return null;
  }
}
