import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';
import { LazyTab } from '../../../shared/interfaces/tab-component.interface';
import { tabLazyComponentMap } from '../../../utils/tab-component-lazy-map';

/**
 * Google login button configuration
 */
export const googleButtonConfig: ButtonConfig = {
  label: 'Google',
  imageSrc: '../../../../../assets/images/google.svg',
  variant: 'secondary',
};

/**
 * Facebook login button configuration
 */
export const facebookButtonConfig: ButtonConfig = {
  label: 'Facebook',
  matIcon: 'facebook',
  iconFontSet: 'material-icons',
  imagePosition: 'left',
  variant: 'secondary',
  fontWeight: 500,
};

/**
 * Login/Signup tab configurations
 */
export const loginSignUpTabsConfig: LazyTab[] = [
  {
    id: 'login-form',
    label: 'Sign In',
    loadChildren: tabLazyComponentMap['login-form'],
  },
  {
    id: 'register-form',
    label: 'Sign Up',
    loadChildren: tabLazyComponentMap['register-form'],
  },
];
