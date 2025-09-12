import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';

export const saveAndNextButtonConfig: ButtonConfig = {
  label: 'Save & Next',
  fontWeight: 500,
  variant: 'primary',
  type: 'submit',
  imagePosition: 'right',
  matIcon: 'keyboard_arrow_right',
  iconFontSet: 'material-icons',
};

export const previousButtonConfig: ButtonConfig = {
  label: 'Previous',
  fontWeight: 500,
  variant: 'primary',
  type: 'button',
  imagePosition: 'left',
  matIcon: 'keyboard_arrow_left',
  iconFontSet: 'material-icons',
};

export const disabledSaveAndNextButtonConfig: ButtonConfig = {
  label: 'Save & Next',
  fontWeight: 500,
  variant: 'primary',
  type: 'submit',
  imagePosition: 'right',
  matIcon: 'keyboard_arrow_right',
  iconFontSet: 'material-icons',
  isDisabled: true,
};

export const disabledPreviousButtonConfig: ButtonConfig = {
  label: 'Previous',
  fontWeight: 500,
  variant: 'primary',
  type: 'button',
  imagePosition: 'left',
  matIcon: 'keyboard_arrow_left',
  isDisabled: true,
  iconFontSet: 'material-icons',
};

export const submitButtonConfig: ButtonConfig = {
  label: 'Submit',
  fontWeight: 500,
  variant: 'gradient',
  type: 'submit',
};

export const markForReviewButtonConfig: ButtonConfig = {
  label: 'Mark for Review',
  fontWeight: 500,
  variant: 'primary',
  type: 'button',
  imagePosition: 'left',
  matIcon: 'outlined_flag',
  iconFontSet: 'material-icons',
};

export const markedForReviewButtonConfig: ButtonConfig = {
  label: 'Marked',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
  imagePosition: 'left',
  matIcon: 'outlined_flag',
  iconFontSet: 'material-icons',
};

export const markFlagButtonConfig: ButtonConfig = {
  label: '',
  fontWeight: 500,
  variant: 'primary',
  type: 'button',
  imagePosition: 'left',
  matIcon: 'outlined_flag',
  iconFontSet: 'material-icons',
};

export const markedFlagButtonConfig: ButtonConfig = {
  label: '',
  fontWeight: 500,
  variant: 'secondary',
  type: 'button',
  imagePosition: 'left',
  matIcon: 'outlined_flag',
  iconFontSet: 'material-icons',
};

export const startQuizButtonConfig: ButtonConfig = {
  label: 'Start Quiz',
  fontWeight: 500,
  variant: 'gradient',
  type: 'button',
  imagePosition: 'left',
  matIcon: 'play_arrow',
  iconFontSet: 'material-icons',
};

export const backToBrowseQuizButtonConfig: ButtonConfig = {
  label: 'Back to Browse',
  fontWeight: 500,
  variant: 'gradient',
  type: 'button',
  imagePosition: 'left',
  matIcon: 'arrow_back',
  iconFontSet: 'material-icons',
};

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
};

export const submitDialogButtonConfig: ButtonConfig = {
  label: 'Submit Quiz',
  variant: 'secondary',
};

export const submitQuizDialog: ConfirmationDialogData = {
  title: 'Submit Quiz',
  message: 'Are you sure you want to submit this quiz?',
  confirmButtonConfig: submitDialogButtonConfig,
  cancelButtonConfig: cancelButtonConfig,
};
