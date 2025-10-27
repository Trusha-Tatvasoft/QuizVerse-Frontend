import { Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { regexPatterns } from '../../../../utils/constants';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

export const adminProfilePageHeader: PageHeaderComponent = {
  icon: 'persone',
  title: 'Admin Profile',
  subtitle: 'Manage your personal information',
  theme: 'quiz',
};

export const adminProfileFormFields: DynamicFormField[] = [
  {
    name: 'fullName',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Full name',
    icon: 'account_circle',
    validators: [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(255),
      Validators.pattern(regexPatterns.NAME),
    ],
    validationMessages: {
      required: 'Full Name is required.',
      minlength: 'Full Name must be at least 1 characters.',
      maxlength: 'Full Name must not exceed 255 characters.',
      pattern: "Full Name must start with a letter/number and may only include . - '",
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
      Validators.pattern(regexPatterns.USERNAME),
      Validators.minLength(3),
      Validators.maxLength(255),
    ],
    validationMessages: {
      required: 'Username is required.',
      minlength: 'Username must be at least 3 characters.',
      maxlength: 'Username must not exceed 255 characters.',
      pattern:
        'Username can only contain letters, numbers, and special characters (!@#$%^&*()_+-=[]{};:,.<>/?\\|~)',
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
      Validators.pattern(regexPatterns.EMAIL),
      Validators.maxLength(255),
    ],
    validationMessages: {
      required: 'Email is required.',
      pattern: 'Please enter a valid email address.',
      maxlength: 'Email must not exceed 255 characters.',
    },
    gridClass: 'col-span-1 sm:col-span-2',
  },
  {
    name: 'otp',
    label: 'OTP',
    type: 'text',
    placeholder: 'Enter OTP',
    validators: [],
    validationMessages: {},
    icon: 'lock',
  },
  {
    name: 'bio',
    label: 'Bio',
    type: 'textarea',
    placeholder: 'Tell us about yourself',
    icon: 'info',
    validators: [Validators.maxLength(255)],
    validationMessages: {
      maxlength: 'Bio must not exceed 255 characters.',
    },
    gridClass: 'col-span-1 sm:col-span-2',
  },
];

export const updateAdminProfileButtonConfig: ButtonConfig = {
  label: 'Save Changes',
  variant: 'secondary',
  fontWeight: 500,
  type: 'submit',
};

export const uploadProfilePicBtnConfig: ButtonConfig = {
  label: '',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
  matIcon: 'upload',
};

export const deleteProfilePicBtnConfig: ButtonConfig = {
  label: '',
  fontWeight: 500,
  variant: 'secondary', // or 'secondary' based on your OutlineButton component variants
  type: 'button',
  matIcon: 'delete',
};
