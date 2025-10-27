import { Validators } from '@angular/forms';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';
import {
  afterStartDateValidator,
  noPastDateValidator,
} from '../../../../utils/no-past-date-validator.utils';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

export const battleCreationHeaderConfig = {
  icon: 'quiz',
  title: 'Create New Battle',
  subtitle: 'Create and configure a new quiz battle',
  theme: 'user' as const,
};

export const stepsToCreateBattle = [
  { heading: 'Create Battle', description: 'Basic battle information' },
  { heading: 'Question Method', description: 'Choose creation method' },
  { heading: 'Add Questions', description: 'Create or select questions' },
  { heading: 'Review', description: 'Review and publish' },
];

export const battleCreationFormFields: DynamicFormField[] = [
  {
    name: 'battleTitle',
    label: 'Battle Title*',
    type: 'text',
    placeholder: 'Enter battle title',
    validators: [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(255),
      Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9 .,!?\-_@#]*$/),
    ],
    validationMessages: {
      required: 'Battle Title is required.',
      minlength: 'Battle Title must be at least 1 characters.',
      maxlength: 'Battle Title must not exceed 255 characters.',
      pattern: 'Battle Title cannot start with a space or special character.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'battleCategory',
    label: 'Battle Category*',
    type: 'select',
    placeholder: 'Select battle category',
    validators: [Validators.required],
    options: [],
    validationMessages: {
      required: 'Battle Category is required.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'description',
    label: 'Description*',
    type: 'textarea',
    placeholder: 'Enter battle description',
    validators: [
      Validators.required,
      Validators.maxLength(500),
      Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9 .,!?\-_@#]*$/),
    ],
    validationMessages: {
      required: 'Description is required.',
      maxlength: 'Description must not exceed 500 characters.',
      pattern: 'Battle Description cannot start with a space or special character.',
    },
    gridClass: 'col-span-1 sm:col-span-2',
  },

  {
    name: 'battleType',
    label: 'Battle Type*',
    type: 'select',
    placeholder: 'Select battle type',
    validators: [Validators.required],
    options: [],
    validationMessages: {
      required: 'Battle Type is required.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'difficultyLevel',
    label: 'Difficulty Level*',
    type: 'select',
    placeholder: 'Select difficulty level',
    validators: [Validators.required],
    options: [],
    validationMessages: {
      required: 'Difficulty Level is required.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'startDate',
    label: 'Start Date*',
    type: 'date',
    placeholder: 'Select start date (mm/dd/yyyy)',
    validators: [Validators.required, noPastDateValidator],
    validationMessages: {
      required: 'Start Date is required.',
      noPastDate: 'Start Date cannot be in the past.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
  {
    name: 'endDate',
    label: 'End Date*',
    type: 'date',
    placeholder: 'Select end date (mm/dd/yyyy)',
    validators: [Validators.required, noPastDateValidator, afterStartDateValidator('startDate')],
    validationMessages: {
      required: 'End Date is required.',
      noPastDate: 'End Date cannot be in the past.',
      afterStartDate: 'End Date must be same or after Start Date.',
    },
    gridClass: 'col-span-1 sm:col-span-1',
  },
];

export const publishBattleButtonConfig: ButtonConfig = {
  label: 'Publish Battle',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
};

export const previewBattleButtonConfig: ButtonConfig = {
  label: 'Preview Battle',
  type: 'button',
  variant: 'secondary',
  matIcon: 'remove_red_eye',
};
