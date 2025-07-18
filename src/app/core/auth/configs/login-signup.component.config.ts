import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';
import { LazyTab } from '../../../shared/interfaces/tab-component.interface';
import { TabLazyComponentMap } from '../../../utils/tab-component-lazy-map';

/**
 * Google login button configuration
 */
export const GOOGLE_BUTTON_CONFIG: ButtonConfig = {
  label: 'Google',
  imageSrc: '../../../../../assets/images/google.svg',
  variant: 'secondary',
};

/**
 * Facebook login button configuration
 */
export const FACEBOOK_BUTTON_CONFIG: ButtonConfig = {
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
export const LOGIN_SIGNUP_TABS_CONFIG: LazyTab[] = [
  {
    id: 'login-form',
    label: 'Sign In',
    loadChildren: TabLazyComponentMap['login-form'],
  },
  {
    id: 'register-form',
    label: 'Sign Up',
    loadChildren: TabLazyComponentMap['register-form'],
  },
];
