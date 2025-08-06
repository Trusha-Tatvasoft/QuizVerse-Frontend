import { ButtonConfig } from './button-config.interface';

export const defaultButtonConfig: Required<ButtonConfig> = {
  isDisabled: false,
  imageSrc: '',
  matIcon: '',
  imagePosition: 'left',
  label: 'Button',
  fontWeight: 500,
  type: 'button',
  iconFontSet: 'material-icons',
  variant: 'primary',
};
