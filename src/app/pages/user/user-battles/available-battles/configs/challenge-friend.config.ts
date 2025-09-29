import { ButtonConfig } from '../../../../../shared/interfaces/button-config.interface';
import { DynamicFormField } from '../../../../../shared/interfaces/dynamic-form-field.interface';

export const cancelButtonConfig: ButtonConfig = {
  label: 'Cancel',
  variant: 'secondary',
  fontWeight: 500,
  type: 'button',
};

export const sendChallengeButtonConfig: ButtonConfig = {
  label: 'Send Challenge',
  variant: 'secondary',
  fontWeight: 500,
  type: 'submit',
};

export const challengeFriendFormField: DynamicFormField = {
  name: 'friendusername',
  label: `Friend's Username`,
  type: 'text',
  placeholder: 'Enter Username',
  icon: 'account_circle',
  validators: [],
};
