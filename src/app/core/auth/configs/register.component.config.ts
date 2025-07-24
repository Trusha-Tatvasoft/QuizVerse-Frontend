import { Validators } from '@angular/forms';
import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';
import { DynamicFormField } from '../../../shared/interfaces/dynamic-form-field.interface';

/**
 * Register button configuration
 */
export const REGISTER_BUTTON_CONFIG: ButtonConfig = {
  label: 'Create An Account',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
};

/**
 * Register form field configurations
 */
export const REGISTER_FORM_FIELDS: DynamicFormField[] = [
  {
    name: 'fullName',
    label: 'Full Name',
    type: 'text',
    placeholder: 'John Doe',
    validators: [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^(?!\s)[\s\S]+$/),
    ],
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
    validators: [
      Validators.required,
      Validators.pattern(/^[^\s][a-zA-Z0-9._%+-]*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/),
    ],
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: '••••••',
    validators: [
      Validators.required,
      Validators.pattern(/^\S*$/),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/),
    ],
  },
];
