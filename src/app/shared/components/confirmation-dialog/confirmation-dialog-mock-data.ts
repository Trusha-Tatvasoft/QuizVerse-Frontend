import { ConfirmationDialogData } from '../../interfaces/confirmation-dialog.interface';

export const mockDataDialog: ConfirmationDialogData = {
  title: 'Delete Category',
  message: 'Are you sure you want to delete this category?',
  confirmButtonConfig: {
    label: 'Delete',
    variant: 'primary',
  },
  cancelButtonConfig: {
    label: 'Cancel',
    variant: 'secondary',
  },
  imageUrl: 'assets/images/alert-triangle.svg',
};
