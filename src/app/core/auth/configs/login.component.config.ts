import { Validators } from '@angular/forms';
import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';
import { DynamicFormField } from '../../../shared/interfaces/dynamic-form-field.interface';

/**
 * Sign In button configuration
 */
export const SIGNIN_BUTTON_CONFIG: ButtonConfig = {
  label: 'Sign In',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
};

/**
 * Login form field configurations
 */
export const LOGIN_FORM_FIELDS: DynamicFormField[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
    validators: [Validators.required, Validators.email],
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: '••••••',
    validators: [Validators.required],
  },
];
