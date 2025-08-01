import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ValidationMessageMap } from '../../interfaces/validation-message-map.interface';

@Injectable({ providedIn: 'root' })
export class ValidationErrorService {
  // Fields that should not allow spaces
  private readonly noSpaceFields = ['username', 'password'];

  getErrorMessage(
    control: AbstractControl,
    customMessages: ValidationMessageMap = {},
    fieldName?: string,
  ): string | null {
    if (!control || !control.errors || !control.touched) return null;

    const errors: ValidationErrors = control.errors;

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return customMessages[key] || 'This field is required.';

        case 'minlength':
          return customMessages[key] || `Minimum length is ${errors[key].requiredLength}.`;

        case 'maxlength':
          return customMessages[key] || `Maximum length is ${errors[key].requiredLength}.`;

        case 'email':
          return customMessages[key] || 'Invalid email address.';

        case 'pattern':
          // Check if fieldName is in noSpaceFields and contains space
          if (
            fieldName &&
            this.noSpaceFields.includes(fieldName.toLowerCase()) &&
            typeof control.value === 'string' &&
            control.value.includes(' ')
          ) {
            return `${this.capitalize(fieldName)} cannot contain spaces.`;
          }
          return customMessages[key] || 'Invalid format.';

        case 'passwordMismatch':
          return customMessages[key] || 'Passwords do not match.';

        default:
          return customMessages[key] || `Invalid: ${key}`;
      }
    }

    return null;
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
