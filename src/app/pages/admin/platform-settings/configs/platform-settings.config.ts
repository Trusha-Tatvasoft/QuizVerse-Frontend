import { Validators } from '@angular/forms';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

// Header section config
export const platformSettingHeaderConfig = {
  icon: 'settings',
  title: 'Platform Configuration',
  subtitle: 'Configure general platform settings and payment options',
  theme: 'user' as const,
};

//plateform setting form field config
export const platformSettingsFormFields: DynamicFormField[] = [
  {
    name: 'landingPageQuote',
    label: 'Landing Page Quote*',
    type: 'textarea',
    placeholder: 'Enter landing page quote',
    validators: [
      Validators.required,
      Validators.maxLength(500),
      Validators.pattern(/^(?!\s)(?!.*[<>]).+$/),
    ],
    validationMessages: {
      required: 'Landing Page Quote is required.',
      maxlength: 'Quote must not exceed 500 characters.',
      pattern: 'Question should not start with a space and enter plain text only.',
    },
    gridClass: 'col-span-1 sm:col-span-2',
  },
  {
    name: 'primaryColor',
    label: 'Primary Color*',
    type: 'color',
    placeholder: '#000000',
    validators: [Validators.required, Validators.pattern(/^#([0-9A-Fa-f]{6})$/)],
    validationMessages: {
      required: 'Primary Color is required.',
      pattern: 'Please enter a valid hex color code.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'secondaryColor',
    label: 'Secondary Color*',
    type: 'color',
    placeholder: '#FFFFFF',
    validators: [Validators.required, Validators.pattern(/^#([0-9A-Fa-f]{6})$/)],
    validationMessages: {
      required: 'Secondary Color is required.',
      pattern: 'Please enter a valid hex color code.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'siteLogo',
    label: 'Site Logo',
    type: 'file',
    placeholder: 'Upload site logo',
    validators: [],
    validationMessages: {},
    gridClass: 'col-span-1 sm:col-span-2',
  },
];

//save plateform configuration button config
export const savePlateformButtonConfig: ButtonConfig = {
  label: 'Save Platform Settings',
  fontWeight: 500,
  variant: 'secondary',
  type: 'submit',
};

//save plateform configuration button config
export const chooseFileButtonConfig: ButtonConfig = {
  label: 'Choose File',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
};
