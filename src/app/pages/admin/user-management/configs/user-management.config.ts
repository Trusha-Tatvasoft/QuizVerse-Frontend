import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

// Header section config for User Management page
export const USER_HEADER_CONFIG = {
  icon: 'shield',
  title: 'User Management',
  subtitle: 'Manage user accounts, roles, and permissions',
  theme: 'user' as const, // Used for theming the header
};

// Config for the search input field
export const SEARCH_INPUT_CONFIG = {
  placeholder: 'Search users(name/email)...',
};

// Config for the "Add User" button
export const ADD_USER_BUTTON_CONFIG: ButtonConfig = {
  label: 'Add User',
  matIcon: 'person_add',
  iconFontSet: 'material-icons',
  imagePosition: 'left',
  variant: 'secondary',
  fontWeight: 500,
};

// Config for the "Export User" button
export const EXPORT_BUTTON_CONFIG: ButtonConfig = {
  label: 'Export User',
  variant: 'secondary',
  fontWeight: 500,
};
