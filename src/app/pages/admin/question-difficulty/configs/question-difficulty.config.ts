import { Validators } from '@angular/forms';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';
import { ColumnDef } from '../../../../shared/interfaces/table-component.interface';

// Header section config
export const questionDifficultyManagementHeaderConfig = {
  icon: 'psychology',
  title: 'Question Difficulty Management',
  subtitle: 'Configure difficulty levels for questions with XP rewards',
  theme: 'queDifficulty' as const,
};

// Table Column Configs
export const questionDifficultyTableColumnsConfig: ColumnDef[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'tag',
    isSortable: false,
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    isSortable: false,
  },
  {
    key: 'xpPerQuestion',
    label: 'XP Per Question',
    type: 'tag',
    isSortable: false,
  },
  {
    key: 'totalQuestions',
    label: 'Total Questions',
    type: 'text',
    isSortable: false,
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'button',
    isSortable: false,
  },
];

// Button Configs
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
};

export const addButtonConfig: ButtonConfig = {
  label: 'Create',
  variant: 'secondary',
  fontWeight: 500,
  type: 'submit',
};

export const editButtonConfig: ButtonConfig = {
  label: 'Update',
  variant: 'secondary',
  fontWeight: 500,
  type: 'submit',
};

// Form Fields Configs
export const questionDifficultyFormFields: DynamicFormField[] = [
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
    validators: [Validators.required, Validators.maxLength(255), Validators.pattern(/^\S.*$/)],
    validationMessages: {
      required: 'Description is required.',
      maxlength: 'Description must not exceed 255 characters.',
      pattern: 'Description cannot start with a space.',
    },
  },
  {
    name: 'xpPerQuestion',
    label: 'XP Per Question',
    type: 'number',
    placeholder: 'XP',
    icon: 'emoji_events',
    validators: [Validators.required, Validators.min(1), Validators.max(100)],
    validationMessages: {
      required: 'XP Per Question is required.',
      min: 'Minimum 1 XP Per Question is required.',
      max: 'XP Per Question must not exceed 100 XP.',
    },
  },
];
