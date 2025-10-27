import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
};

export const startButtonConfig: ButtonConfig = {
  label: 'confirm',
  variant: 'secondary',
};

export const resumeDialogButtonConfig: ButtonConfig = {
  label: 'Resume Battle',
  variant: 'secondary',
};

export const skipButtonConfig: ButtonConfig = {
  label: 'Skip & Start Now',
  variant: 'secondary',
};

export const battleTag: TagInputConfig = {
  id: 'difficulty-easy',
  label: 'Science Battle',
  type: 'static',
  isSelected: false,
  hasBorder: true,
  backgroundColor: 'lightPurple',
  textColor: 'purple',
};

export const nextQuestionButtonConfig: ButtonConfig = {
  label: 'Next',
  fontWeight: 600,
  variant: 'secondary',
  type: 'button',
  imagePosition: 'right',
  matIcon: 'arrow_forward',
  iconFontSet: 'material-icons',
};

export const resumeBattleDialog: ConfirmationDialogData = {
  title: 'Resume Battle',
  message:
    'To continue your Battle, please return to fullscreen mode. Cancelling it will submit the Battle.',
  confirmButtonConfig: resumeDialogButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};
