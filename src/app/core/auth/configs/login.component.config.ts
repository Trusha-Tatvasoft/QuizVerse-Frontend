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
    placeholder: 'Enter your email',
    icon: 'mail',
    validators: [
      Validators.required,
      Validators.pattern(/^[^\s][a-zA-Z0-9._%+-]*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/),
    ],
    validationMessages: {
      required: 'Email is required.',
      pattern: 'Please enter a valid email address.',
    },
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    icon: 'lock',
    validators: [Validators.required],
    validationMessages: {
      required: 'Password is required.',
    },
  },
];
