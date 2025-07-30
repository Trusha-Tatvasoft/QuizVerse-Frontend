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
    placeholder: 'Full name',
    icon: 'account_circle',
    validators: [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^(?!\s)[A-Za-z ]+$/),
    ],
    validationMessages: {
      required: 'Full Name is required.',
      minlength: 'Full Name must be at least 3 characters.',
      pattern: 'Full Name must only contain letters and cannot start with a space.',
    },
  },
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'Username',
    icon: 'person',
    validators: [
      Validators.required,
      Validators.pattern(/^[a-zA-Z][a-zA-Z0-9._]*$/),
      Validators.minLength(5),
    ],
    validationMessages: {
      required: 'Username is required.',
      minlength: 'Username must be at least 5 characters.',
      pattern: 'Username must start with a letter.',
    },
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Email address',
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
    placeholder: 'Password',
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
