import { Validators } from '@angular/forms';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

export const profileFormFields: DynamicFormField[] = [
  {
    name: 'fullName',
    label: 'Full Name*',
    type: 'text',
    placeholder: 'Enter your full name',
    icon: 'person',
    validators: [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(255),
      Validators.pattern(/^(?!\s)[A-Za-z ]+$/),
    ],
    validationMessages: {
      required: 'Full Name is required.',
      minlength: 'Full Name must be at least 1 characters.',
      maxlength: 'Full Name must not exceed 255 characters.',
      pattern: 'Full Name must only contain letters and cannot start with a space.',
    },
  },
  {
    name: 'email',
    label: 'Email*',
    type: 'email',
    placeholder: 'Enter your email',
    icon: 'email',
    validators: [
      Validators.required,
      Validators.pattern(/^[^\s][a-zA-Z0-9._%+-]*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/),
      Validators.maxLength(255),
    ],
    validationMessages: {
      required: 'Email is required.',
      pattern: 'Please enter a valid email address.',
      maxlength: 'Email must not exceed 255 characters.',
    },
  },
  {
    name: 'otp',
    label: 'OTP*',
    type: 'text',
    placeholder: 'Enter OTP',
    validators: [],
    icon: 'lock',
  },
  {
    name: 'bio',
    label: 'Bio',
    type: 'textarea',
    placeholder: 'Tell us about yourself',
    icon: 'edit',
    validators: [Validators.maxLength(255)],
    validationMessages: {
      maxlength: 'Bio must not exceed 255 characters.',
    },
  },
];

export const submitButtonConfig: ButtonConfig = {
  label: 'Save Changes',
  fontWeight: 500,
  variant: 'secondary',
  type: 'submit',
};

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
};

export const verifyOtpButtonConfig: ButtonConfig = {
  label: 'Verify OTP',
  matIcon: 'verified',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
};

export const sendOtpButtonConfig: ButtonConfig = {
  label: 'Send OTP',
  matIcon: 'send',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
};

export const resendOtpButtonConfig: ButtonConfig = {
  label: 'Resend OTP',
  matIcon: 'send',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
};
