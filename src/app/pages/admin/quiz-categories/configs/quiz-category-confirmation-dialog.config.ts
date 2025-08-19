import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';
import { cancelButtonConfig } from '../../user-management/configs/user-confirmation-dialog.config';
import {
  activateButtonConfig,
  deleteButtonConfig,
  inactivateButtonConfig,
} from './quiz-category-button.config';

// Confirmation Dialog Config for Deleting a Quiz Category
export const deleteQuizCategoryConfig: ConfirmationDialogData = {
  title: 'Delete Category',
  message:
    'Are you sure you want to delete this category? This action cannot be undone and will affect all quizzes in this category.',
  confirmButtonConfig: deleteButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const activateQuizCategoryConfig: ConfirmationDialogData = {
  title: 'Activate Category',
  message:
    'Are you sure you want to activate this category? They will regain access to the platform.',
  confirmButtonConfig: activateButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const inActivateQuizCategoryConfig: ConfirmationDialogData = {
  title: 'Inactivate Category',
  message:
    'Are you sure you want to inactivate this category? They will lose access to the platform.',
  confirmButtonConfig: inactivateButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};
