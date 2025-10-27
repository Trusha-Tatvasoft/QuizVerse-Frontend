import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
};

export const deleteButtonConfig: ButtonConfig = {
  label: 'Delete Battle',
  variant: 'secondary',
};

export const deleteBattleDialog: ConfirmationDialogData = {
  title: 'Delete Battle',
  message:
    'Are you sure you want to delete this battle? This action cannot be undone. All battle data will be deleted.',
  confirmButtonConfig: deleteButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};
