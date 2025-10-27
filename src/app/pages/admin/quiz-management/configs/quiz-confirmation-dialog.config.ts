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

export const activateButtonConfig: ButtonConfig = {
  label: 'Activate Quiz',
  variant: 'secondary',
};

export const inactivateButtonConfig: ButtonConfig = {
  label: 'Inactivate Quiz',
  variant: 'secondary',
};

export const deleteQuizDialog: ConfirmationDialogData = {
  title: 'Delete Quiz',
  message:
    'Are you sure you want to delete this quiz? This action cannot be undone. All quiz data will be deleted.',
  confirmButtonConfig: deleteButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const activateQuizDialog: ConfirmationDialogData = {
  title: 'Activate Quiz',
  message:
    'Are you sure you want to activate this quiz? Once activated, users will regain access to it on the platform.',
  confirmButtonConfig: activateButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const inactivateQuizDialog: ConfirmationDialogData = {
  title: 'Inactivate Quiz',
  message:
    'Are you sure you want to inactivate this quiz? Once inactivated, users will no longer be able to access it on the platform.',
  confirmButtonConfig: inactivateButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};
