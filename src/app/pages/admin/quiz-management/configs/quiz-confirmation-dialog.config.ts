import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
};

export const deleteButtonConfig: ButtonConfig = {
  label: 'Delete Quiz',
  variant: 'secondary',
};

export const deleteQuizDialog: ConfirmationDialogData = {
  title: 'Delete Quiz',
  message:
    'Are you sure you want to delete this quiz? This action cannot be undone. All quiz data will be deleted.',
  confirmButtonConfig: deleteButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};
