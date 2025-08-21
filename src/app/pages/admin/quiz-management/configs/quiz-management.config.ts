import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { QuizManagementCardDetails } from '../interfaces/quiz-management-card-details.interface';
import { QuizManagementSummary } from '../interfaces/quiz-management-summary.interface';

// Header section config for Quiz Management Stats
export const quizManagementCardConfig: Record<
  keyof QuizManagementSummary,
  QuizManagementCardDetails
> = {
  totalQuiz: { title: 'Total Quizzes', icon: 'menu_book', iconColor: 'blue' },
  totalParticipants: { title: 'Total Participants', icon: 'group', iconColor: 'green' },
  activeQuiz: { title: 'Active Quizzes', icon: 'schedule', iconColor: 'red' },
  totalQuestions: { title: 'Total Questions', icon: 'edit', iconColor: 'purple' },
};

// Header section config for Quiz Management page
export const quizManagementHeaderConfig: PageHeaderComponent = {
  icon: 'quiz',
  title: 'Quiz Management',
  subtitle: 'Create, update, and organize quizzes',
  theme: 'quiz',
};

// Config for the search input field
export const searchInputConfig = {
  placeholder: 'Search quizzes(title/category)...',
};

// Config for the "Create New Quiz" button
export const createNewQuizButtonConfig: ButtonConfig = {
  label: 'Create New Quiz',
  matIcon: 'add',
  iconFontSet: 'material-icons',
  imagePosition: 'left',
  variant: 'secondary',
  fontWeight: 500,
};
