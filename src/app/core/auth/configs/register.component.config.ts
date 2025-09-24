import { Validators } from '@angular/forms';
import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';
import { DynamicFormField } from '../../../shared/interfaces/dynamic-form-field.interface';
import { RegexPatterns } from '../../../utils/constants';

/**
 * Register button configuration
 */
export const registerButtonConfig: ButtonConfig = {
  label: 'Create An Account',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
};

export const createUserButtonConfig: ButtonConfig = {
  label: 'Create User',
  variant: 'secondary',
  fontWeight: 500,
  type: 'submit',
};

export const updateUserButtonConfig: ButtonConfig = {
  label: 'Update User',
  variant: 'secondary',
  fontWeight: 500,
  type: 'submit',
};

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
  fontWeight: 500,
};

/**
 * Register form field configurations
 */
export const registerFormFields: DynamicFormField[] = [
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
      Validators.pattern(RegexPatterns.NAME),
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
      Validators.pattern(RegexPatterns.USERNAME),
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
      Validators.pattern(RegexPatterns.EMAIL),
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
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Password',
    icon: 'lock',
    validators: [
      Validators.required,
      Validators.pattern(RegexPatterns.PASSWORD),
      Validators.minLength(8),
      Validators.maxLength(30),
    ],
    validationMessages: {
      required: 'Password is required.',
      minlength: 'Password must be at least 8 characters.',
      maxlength: 'Password must not exceed 30 characters.',
      pattern: 'Password must be 8+ characters with upper, lower, number & symbol.',
    },
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Confirm your password',
    icon: 'lock',
    validators: [Validators.required],
    validationMessages: {
      required: 'Confirm Password is required.',
    },
  },
];

export const userFormFields: DynamicFormField[] = [
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
      Validators.pattern(RegexPatterns.NAME),
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
      Validators.pattern(RegexPatterns.USERNAME),
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
      Validators.pattern(RegexPatterns.EMAIL),
      Validators.maxLength(255),
    ],
    validationMessages: {
      required: 'Email is required.',
      pattern: 'Please enter a valid email address.',
      maxlength: 'Email must not exceed 255 characters.',
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
      Validators.pattern(RegexPatterns.PASSWORD),
      Validators.minLength(8),
      Validators.maxLength(30),
    ],
    validationMessages: {
      required: 'Password is required.',
      minlength: 'Password must be at least 8 characters.',
      maxlength: 'Password must not exceed 30 characters.',
      pattern: 'Password must be 8+ characters with upper, lower, number & symbol.',
    },
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
  {
    name: 'profilePicture',
    label: 'Profile Picture',
    type: 'file',
    validators: [],
    placeholder: '',
    validationMessages: {
      fileSize: 'File size must be less than 5MB.',
      fileType: 'Only JPG, JPEG, and PNG formats are allowed.',
    },
    gridClass: 'col-span-1 sm:col-span-2',
  },
];

export const uploadButtonConfig: ButtonConfig = {
  label: 'Choose File',
  variant: 'secondary',
  fontWeight: 500,
};
