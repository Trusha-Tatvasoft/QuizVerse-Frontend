import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

export const submitRatingButtonConfig: ButtonConfig = {
  label: 'Submit Rating',
  variant: 'secondary',
  matIcon: 'thumb_up',
  imagePosition: 'left',
};

export const backToDashboardButtonConfig: ButtonConfig = {
  label: 'Back to Dashboard',
  variant: 'secondary',
  matIcon: 'dashboard',
  imagePosition: 'left',
};

export const backToQuizButtonConfig: ButtonConfig = {
  label: 'Back to Browse Quizzes',
  variant: 'secondary',
  matIcon: 'dashboard',
  imagePosition: 'left',
};

export const cancelButton: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
};

export const submitButton: ButtonConfig = {
  label: 'Submit Report',
  variant: 'secondary',
  type: 'submit',
};
