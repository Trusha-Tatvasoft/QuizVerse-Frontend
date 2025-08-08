import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

// Header section config for Question Pool Management page
export const questionPoolHeaderConfig = {
  icon: 'folder_copy',
  title: 'Question Pool Management',
  subtitle: 'Manage questions for quizzes and battles',
  theme: 'quizDifficulty' as const,
};

// Config for the search input field
export const searchInputConfig = {
  placeholder: 'Search questions...',
};

// Config for the "Add Question Pool" button
export const addQuestionButtonConfig: ButtonConfig = {
  label: 'Add Question',
  matIcon: 'add',
  iconFontSet: 'material-icons',
  variant: 'secondary',
  fontWeight: 500,
};
