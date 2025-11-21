import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
};

export const closeButtonConfig: ButtonConfig = {
  label: 'Close',
  variant: 'secondary',
};

export const ignoreButtonConfig: ButtonConfig = {
  label: 'Ignore Report',
  variant: 'secondary',
};

export const acceptReportButtonConfig: ButtonConfig = {
  label: 'Accept Report',
  variant: 'secondary',
};

export const acceptReportForDialogButtonConfig: ButtonConfig = {
  label: 'Accept',
  variant: 'primary',
  matIcon: 'check_circle',
  imagePosition: 'left',
  iconFontSet: 'material-icons-outlined',
};

export const ignoreReportForDialogButtonConfig: ButtonConfig = {
  label: 'Ignore',
  variant: 'secondary',
  matIcon: 'block',
  imagePosition: 'left',
  iconFontSet: 'material-icons-outlined',
};

export const acceptedDialog: ConfirmationDialogData = {
  title: 'Accept Report',
  message:
    'Are you sure you want to accept this report? This action cannot be undone and this comment will not be shown again in the quiz comment section.',
  confirmButtonConfig: acceptReportButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};

export const ignoredDialog: ConfirmationDialogData = {
  title: 'Ignore Report',
  message: 'Do you want to ignore this report? It will be closed without any further review.',
  confirmButtonConfig: ignoreButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};
