import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

// Header section config for User Management page
export const quizCategoryHeaderConfig = {
  icon: 'folder_copy',
  title: 'Quiz Categories Management',
  subtitle: 'Organize quizzes by categories and subjects',
  theme: 'quiz' as const,
};

// Config for the search input field
export const searchInputConfig = {
  placeholder: 'Search categories...',
};

// Config for the "Add Category" button
export const addCategoryButtonConfig: ButtonConfig = {
  label: 'Add Category',
  matIcon: 'add',
  iconFontSet: 'material-icons',
  variant: 'secondary',
  fontWeight: 500,
};
