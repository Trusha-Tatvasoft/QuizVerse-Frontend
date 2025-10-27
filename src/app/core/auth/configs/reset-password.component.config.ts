import { Validators } from '@angular/forms';
import { DynamicFormField } from '../../../shared/interfaces/dynamic-form-field.interface';
import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';

export const resetPasswordFormField: DynamicFormField[] = [
  {
    name: 'password',
    icon: 'lock',
    label: 'New Password',
    type: 'password',
    placeholder: 'New password',
    validators: [
      Validators.required,
      Validators.pattern(/^(?=\S*$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/),
    ],
    validationMessages: {
      required: 'New Password is required.',
      pattern: 'Password must be 8+ characters with upper, lower, number & symbol.',
    },
  },
  {
    name: 'confirmPassword',
    icon: 'lock',
    label: 'Confirm New Password',
    type: 'password',
    placeholder: 'Confirm password',
    validators: [Validators.required],
    validationMessages: {
      required: 'Confirm Password is required.',
    },
  },
];

export const sendResetLinkConfig: ButtonConfig = {
  label: 'Update Password',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
};
