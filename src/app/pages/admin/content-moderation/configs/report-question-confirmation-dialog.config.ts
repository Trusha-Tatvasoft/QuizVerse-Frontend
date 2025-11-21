import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';

//#region Table Action button
export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
};

export const markAsResolvedButtonConfig: ButtonConfig = {
  label: 'Mark as Resolved',
  variant: 'secondary',
};

export const ignoreButtonConfig: ButtonConfig = {
  label: 'Ignore Report',
  variant: 'secondary',
};

export const markPendingButtonConfig: ButtonConfig = {
  label: 'Revert to Pending',
  variant: 'secondary',
};

export const markUnderReviewButtonConfig: ButtonConfig = {
  label: 'Mark as Under Review',
  variant: 'secondary',
};
//#endregion

//#region Dialog config
export const ignoredDialog: ConfirmationDialogData = {
  title: 'Ignore Report',
  message: 'Do you want to ignore this report? It will be closed without any further review.',
  confirmButtonConfig: ignoreButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const pendingDialog: ConfirmationDialogData = {
  title: 'Revert to Pending',
  message: 'Are you sure you want to revert this report back to pending status for further review?',
  confirmButtonConfig: markPendingButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const underReviewDialog: ConfirmationDialogData = {
  title: 'Mark as Under Review',
  message:
    'Do you want to mark this report as under review? Other reviewers will see it as being handled.',
  confirmButtonConfig: markUnderReviewButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const confirmUpdateQuestionButtonConfig: ButtonConfig = {
  label: 'Confirm Update',
  fontWeight: 500,
  variant: 'secondary',
  type: 'submit',
};
