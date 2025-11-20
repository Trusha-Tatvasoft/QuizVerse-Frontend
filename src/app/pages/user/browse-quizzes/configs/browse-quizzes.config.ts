import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';

// Config for the search input field
export const searchInputConfig = {
  placeholder: 'Search quizzes...',
};

// Config for the buttons
export const showFilterButtonConfig: ButtonConfig = {
  label: 'Filters',
  matIcon: 'tune',
  iconFontSet: 'material-icons',
  variant: 'secondary',
  fontWeight: 500,
};

export const clearFilterButtonConfig: ButtonConfig = {
  label: 'Clear Filters',
  variant: 'secondary',
  fontWeight: 500,
};

export const loadMoreButtonConfig: ButtonConfig = {
  label: 'Load More',
  variant: 'primary',
  fontWeight: 500,
};

export const reportQuizButtonConfig: ButtonConfig = {
  label: '',
  variant: 'secondary',
  fontWeight: 500,
  matIcon: 'warning',
  iconFontSet: 'material-icons-outlined',
};

// Common default config for all tags
export const defaultTagConfig: Omit<TagInputConfig, 'id' | 'label'> = {
  type: 'selectable',
  isSelected: false,
  hasBorder: true,
  backgroundColor: 'white',
  textColor: 'black',
};

export const browseQuizHeaderConfig: PageHeaderComponent = {
  icon: 'search',
  title: 'Browse Quizzes',
  subtitle: 'Discover and attempt quizzes across categories and difficulty levels',
  theme: 'quiz',
};
