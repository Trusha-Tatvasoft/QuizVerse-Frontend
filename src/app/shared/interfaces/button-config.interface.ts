export interface ButtonConfig {
  isDisabled?: boolean;
  imageSrc?: string;
  matIcon?: string;
  imagePosition?: 'left' | 'right';
  label?: string;
  fontWeight?: number;
  type?: 'button' | 'submit' | 'reset';
  iconFontSet?: 'material-icons-outlined' | 'material-icons';
  variant?: 'primary' | 'secondary' | 'gradient';
}
