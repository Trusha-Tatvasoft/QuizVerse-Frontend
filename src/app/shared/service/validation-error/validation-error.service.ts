import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ValidationMessageMap } from '../../interfaces/validation-message-map.interface';

@Injectable({ providedIn: 'root' })
export class ValidationErrorService {
  getErrorMessage(
    control: AbstractControl,
    customMessages: ValidationMessageMap = {},
  ): string | null {
    if (!control || !control.errors || !control.touched) return null;

    const errors: ValidationErrors = control.errors;

    for (const key of Object.keys(errors)) {
      // Priority 1: Custom message
      if (customMessages[key]) return customMessages[key];

      // Priority 2: Default message via switch
      switch (key) {
        case 'required':
          return 'This field is required.';
        case 'minlength':
          return `Minimum length is ${errors[key].requiredLength}.`;
        case 'maxlength':
          return `Maximum length is ${errors[key].requiredLength}.`;
        case 'email':
          return 'Invalid email address.';
        case 'pattern':
          return 'Invalid format.';
        default:
          return `Invalid: ${key}`;
      }
    }

    return null;
  }
}
