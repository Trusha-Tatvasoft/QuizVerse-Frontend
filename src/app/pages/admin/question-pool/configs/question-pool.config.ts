import { Validators } from '@angular/forms';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';
import { DynamicFormField } from '../../../../shared/interfaces/dynamic-form-field.interface';

// Header section config for Question Pool Management page
export const questionPoolHeaderConfig = {
  icon: 'folder_copy',
  title: 'Question Pool Management',
  subtitle: 'Manage questions for quizzes and battles',
  theme: 'quizDifficulty' as const,
};

// Config for the search input field
export const searchInputConfig = {
  placeholder: 'Search questions...',
};

// Config for the "Add Question Pool" button
export const addQuestionButtonConfig: ButtonConfig = {
  label: 'Add Question',
  matIcon: 'add',
  iconFontSet: 'material-icons',
  variant: 'secondary',
  fontWeight: 500,
};

// Config for the "Question Form" buttons
export const submitButtonConfig: ButtonConfig = {
  label: 'Submit',
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

// Config for the "Delete Dialog"
export const deleteButtonConfig: ButtonConfig = {
  label: 'Delete Question',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
};

export const deleteQuestionDialog: ConfirmationDialogData = {
  title: 'Delete Question',
  message:
    'Are you sure you want to delete this Question? This action cannot be undone. All question data will be permanently deleted.',
  confirmButtonConfig: deleteButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const addButtonConfig: ButtonConfig = {
  label: 'Add',
  fontWeight: 500,
  variant: 'secondary',
  type: 'submit',
};

export const generateQueButtonConfig: ButtonConfig = {
  label: 'Generate Question',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
};

export const resetBtnConfig: ButtonConfig = {
  label: 'Reset All',
  fontWeight: 500,
  variant: 'secondary',
  type: 'submit',
};

export const promptTextAreaFormFields: DynamicFormField[] = [
  {
    name: 'prompt',
    label: 'Prompt To Generate Questions*',
    type: 'textarea',
    placeholder: 'Write the prompt here...',
    icon: 'message',
    validators: [
      Validators.required,
      Validators.maxLength(500),
      Validators.minLength(25),
      Validators.pattern(/^$|^\S[\s\S]*$/),
    ],
    validationMessages: {
      required: 'Prompt text is required.',
      minLength: 'Prompt must be at least 25 characters long.',
      maxLength: 'Prompt cannot exceed 500 characters.',
      pattern: 'Prompt should not start with a space.',
    },
  },
];

export const importQuestionFromWebFormFields: DynamicFormField[] = [
  {
    name: 'url',
    label: 'Web Url',
    type: 'text',
    placeholder: 'Enter a Web Url',
    icon: 'insert_link',
    validators: [
      Validators.required,
      Validators.pattern(/^(?!.*\s)(?:https?:\/\/)?[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+(?:\/\S*)?$/),
    ],
    validationMessages: {
      required: 'A Web Url is required.',
      pattern: 'Please enter a valid URL without spaces (e.g., https://example.com).',
    },
  },
];
