import { Validators } from '@angular/forms';
import { DynamicFormField } from '../../../shared/interfaces/dynamic-form-field.interface';
import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';

export const RESET_PASSWORD_FOEM_FIELD: DynamicFormField[] = [
  {
    name: 'password',
    label: 'New Password',
    type: 'password',
    placeholder: '••••••',
    validators: [
      Validators.required,
      Validators.pattern(/^\S*$/),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/),
    ],
  },
  {
    name: 'confirmPassword',
    label: 'Confirm New Password',
    type: 'password',
    placeholder: '••••••',
    validators: [Validators.required],
  },
];

export const SEND_RESET_LINK_CONFIG: ButtonConfig = {
  label: 'Update Password',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
};
