import { Validators } from '@angular/forms';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';
import { ColumnDef } from '../../../../shared/interfaces/table-component.interface';

// Header section config for User Management page
export const quizHeaderConfig = {
  icon: 'workspace_premium',
  title: 'Quiz Difficulty Configuration',
  subtitle: 'Manage quiz difficulty levels and settings',
  theme: 'quizDifficulty' as const,
};

// Config for the "Export User" button
export const addDifficultyButtonConfig: ButtonConfig = {
  label: 'Add Difficulty Level',
  variant: 'secondary',
  fontWeight: 500,
  matIcon: 'add',
  iconFontSet: 'material-icons',
};

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
  fontWeight: 500,
  type: 'button',
};

export const addButtonConfig: ButtonConfig = {
  label: 'Add',
  variant: 'secondary',
  fontWeight: 500,
  type: 'submit',
};

export const quizDifficultyFormFields: DynamicFormField[] = [
  {
    name: 'name',
    label: 'Difficulty Name',
    type: 'text',
    placeholder: 'Name',
    icon: 'account_circle',
    validators: [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
    validationMessages: {
      required: 'Difficulty Name is required.',
      pattern: 'Difficulty Name must contain only alphabets.',
    },
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Tell us about difficulty level',
    icon: 'info',
    validators: [Validators.required, Validators.maxLength(255)],
    validationMessages: {
      required: 'Description is required.',
      maxlength: 'Description must not exceed 255 characters.',
    },
  },
];

export const difficultyTableConfig = {
  title: 'Current Difficulty Levels',
  description: 'Manage existing difficulty configurations',
  columns: <ColumnDef[]>[
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      isSortable: false,
    },
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      isSortable: false,
    },
  ],
};
