import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';

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
