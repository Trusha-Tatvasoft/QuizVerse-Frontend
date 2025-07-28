import { FormControl } from '@angular/forms';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

export const USER_HEADER_CONFIG = {
  icon: 'shield',
  title: 'User Management',
  subtitle: 'Manage user accounts, roles, and permissions',
  theme: 'user' as const,
};

export const SEARCH_INPUT_CONFIG = {
  placeholder: 'Search users(name/email)...',
};

export const ADD_USER_BUTTON_CONFIG: ButtonConfig = {
  label: 'Add User',
  matIcon: 'person_add',
  iconFontSet: 'material-icons',
  imagePosition: 'left',
  variant: 'secondary',
  fontWeight: 500,
};

export const EXPORT_BUTTON_CONFIG: ButtonConfig = {
  label: 'Export User',
  variant: 'secondary',
  fontWeight: 500,
};
