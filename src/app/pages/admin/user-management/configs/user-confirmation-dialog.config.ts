import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
};

export const deleteButtonConfig: ButtonConfig = {
  label: 'Delete User',
  variant: 'secondary',
};

export const suspendButtonConfig: ButtonConfig = {
  label: 'Suspend User',
  variant: 'secondary',
};

export const activateButtonConfig: ButtonConfig = {
  label: 'Activate User',
  variant: 'secondary',
};

export const inactivateButtonConfig: ButtonConfig = {
  label: 'Inactivate User',
  variant: 'secondary',
};

export const deleteUserDialog: ConfirmationDialogData = {
  title: 'Delete User',
  message:
    'Are you sure you want to delete this user? This action cannot be undone. All user data will be permanently deleted.',
  confirmButtonConfig: deleteButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const suspendUserDialog: ConfirmationDialogData = {
  title: 'Suspend User',
  message: 'Do you want to suspend this user? The suspension will be of 30 days.',
  confirmButtonConfig: suspendButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const activateUserDialog: ConfirmationDialogData = {
  title: 'Activate User',
  message: 'Are you sure you want to activate this user? They will regain access to the platform.',
  confirmButtonConfig: activateButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const inactivateUserDialog: ConfirmationDialogData = {
  title: 'Inactivate User',
  message:
    'Are you sure you want to inactivate this user? They will no longer be able to access the platform.',
  confirmButtonConfig: inactivateButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};
