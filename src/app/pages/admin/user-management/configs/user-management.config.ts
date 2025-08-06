import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

// Header section config for User Management page
export const userHeaderConfig = {
  icon: 'shield',
  title: 'User Management',
  subtitle: 'Manage user accounts, roles, and permissions',
  theme: 'user' as const, // Used for theming the header
};

// Config for the search input field
export const searchInputConfig = {
  placeholder: 'Search users(name/email)...',
};

// Config for the "Add User" button
export const addUserButtonConfig: ButtonConfig = {
  label: 'Add User',
  matIcon: 'person_add',
  iconFontSet: 'material-icons',
  imagePosition: 'left',
  variant: 'secondary',
  fontWeight: 500,
};

// Config for the "Export User" button
export const exportButtonConfig: ButtonConfig = {
  label: 'Export User',
  variant: 'secondary',
  fontWeight: 500,
};
