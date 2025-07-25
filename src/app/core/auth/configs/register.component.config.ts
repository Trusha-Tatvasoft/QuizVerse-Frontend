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
    icon: 'account_circle',
    validators: [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^(?!\s)[\s\S]+$/),
    ],
    validationMessages: {
      required: 'Full Name is required.',
      minlength: 'Full Name must be at least 3 characters.',
      pattern: 'Full Name should not start with a space.',
    },
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
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
    placeholder: '••••••',
    icon: 'lock',
    validators: [
      Validators.required,
      Validators.pattern(/^(?=\S*$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/),
    ],
    validationMessages: {
      required: 'Password is required.',
      pattern: 'Password must be 8+ characters with upper, lower, number & symbol.',
    },
  },
];
