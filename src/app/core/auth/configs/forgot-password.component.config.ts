import { Validators } from '@angular/forms';
import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';
import { DynamicFormField } from '../../../shared/interfaces/dynamic-form-field.interface';

export const SEND_RESET_LINK_CONFIG: ButtonConfig = {
  label: 'Send Reset Link',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
};

export const FORGOT_PASSWORD_FORM_FIELDS: DynamicFormField[] = [
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'john@example.com',
    validators: [
      Validators.required,
      Validators.pattern(/^[^\s][a-zA-Z0-9._%+-]*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/),
    ],
  },
];
