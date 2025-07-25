import { Navigations } from '../shared/enums/navigation';
import { TagInputConfig } from '../shared/interfaces/tag-component.interface';
import { TagColor, TagType } from './types/tag-component.type';

export const AppColors = {
  adminBackgroundColor: 'linear-gradient(to right, #fff4f2, #fffaf6)',
  adminTextColor: 'rgb(153 27 27 / var(--tw-text-opacity, 1))',
  adminBorderColor: 'rgb(254 202 202 / var(--tw-border-opacity, 1))',
  adminSubtitleColor: 'rgb(185 28 28 / var(--tw-text-opacity, 1))',

  userBackgroundColor: 'linear-gradient(to right, #eff6ff, #e0f2fe)', // soft blue tones
  userTextColor: '#1e40af',
  userBorderColor: '#bfdbfe',
  userSubtitleColor: '#1d4ed8',

  quizBackgroundColor: 'linear-gradient(to right, #ecebff, #f3f4ff)', // violet tones
  quizTextColor: '#3730a3',
  quizBorderColor: '#c7d2fe',
  quizSubtitleColor: '#4338ca',

  queDifficultyBackgroundColor: 'linear-gradient(to right, #f3e8ff, #faf5ff)', // purple pastel
  queDifficultyTextColor: '#6b21a8',
  queDifficultyBorderColor: '#e9d5ff',
  queDifficultySubtitleColor: '#7e22ce',

  quizDifficultyBackgroundColor: 'linear-gradient(to right, #fff7ed, #fff3e0)', // soft orange
  quizDifficultyTextColor: '#9a3412',
  quizDifficultyBorderColor: '#fed7aa',
  quizDifficultySubtitleColor: '#c2410c',

  emailBackgroundColor: 'linear-gradient(to right, #eff6ff, #e0f2fe)', // same as user
  emailTextColor: '#1e40af',
  emailBorderColor: '#bfdbfe',
  emailSubtitleColor: '#1d4ed8',

  financialBackgroundColor: 'linear-gradient(to right, #ecfdf5, #d1fae5)', // mint green
  financialTextColor: '#065f46',
  financialBorderColor: '#a7f3d0',
  financialSubtitleColor: '#047857',

  darkText: '#333',
};

export const TablePaginationConfig = {
  PageSize: 5,
  TotalItems: 0,
  PageSizeOptions: [5, 10, 20],
};

export const yellow: TagInputConfig = {
  id: '0',
  label: 'warning',
  type: 'static' as TagType,
  backgroundColor: 'lightYellow' as TagColor,
  textColor: 'yellow' as TagColor,
  isSelected: false,
  hasBorder: true,
};

export const green: TagInputConfig = {
  id: '0',
  label: 'success',
  type: 'static' as TagType,
  backgroundColor: 'lightGreen' as TagColor,
  textColor: 'green' as TagColor,
  isSelected: false,
  hasBorder: true,
};

export const red: TagInputConfig = {
  id: '0',
  label: 'error',
  type: 'static' as TagType,
  backgroundColor: 'lightRed' as TagColor,
  textColor: 'red' as TagColor,
  isSelected: false,
  hasBorder: true,
};

export const blue: TagInputConfig = {
  id: '0',
  label: 'info',
  type: 'static' as TagType,
  backgroundColor: 'lightBlue' as TagColor,
  textColor: 'blue' as TagColor,
  isSelected: false,
  hasBorder: true,
};

export const NavigationItems = {
  UserRoutes: [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: `${Navigations.User}/${Navigations.Dashboard}`,
    },
    {
      label: 'Browse Quizzes',
      icon: 'quiz',
      route: `${Navigations.User}/${Navigations.BrowseQuizzes}`,
    },
    {
      label: 'Battles',
      icon: 'sports_kabaddi',
      route: `${Navigations.User}/${Navigations.Battles}`,
    },
    {
      label: 'Tournaments',
      icon: 'sports_esports',
      route: `${Navigations.User}/${Navigations.Tournaments}`,
    },
    {
      label: 'Leaderboard',
      icon: 'emoji_events',
      route: `${Navigations.User}/${Navigations.Leaderboards}`,
    },
    { label: 'Profile', icon: 'person', route: `${Navigations.User}/${Navigations.Profile}` },
  ],

  AdminRoutes: [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: `${Navigations.Admin}/${Navigations.Dashboard}`,
    },
    { label: 'User Management', icon: 'group', route: `${Navigations.Admin}/${Navigations.Users}` },
    {
      label: 'Quiz Management',
      icon: 'quiz',
      route: `${Navigations.Admin}/${Navigations.Quizzes}`,
    },
    {
      label: 'Quiz Categories',
      icon: 'category',
      route: `${Navigations.Admin}/${Navigations.Categories}`,
    },
    {
      label: 'Difficulty Levels',
      icon: 'signal_cellular_alt',
      route: `${Navigations.Admin}/${Navigations.Difficulties}`,
    },
    {
      label: 'Battle Management',
      icon: 'sports_kabaddi',
      route: `${Navigations.Admin}/${Navigations.BattlesAdmin}`,
    },
    {
      label: 'Question Pool',
      icon: 'inventory_2',
      route: `${Navigations.Admin}/${Navigations.QuestionPool}`,
    },
    {
      label: 'Question Difficulty',
      icon: 'bar_chart',
      route: `${Navigations.Admin}/${Navigations.QuestionDifficulty}`,
    },
    {
      label: 'Email Templates',
      icon: 'email',
      route: `${Navigations.Admin}/${Navigations.EmailTemplates}`,
    },
    {
      label: 'Platform Settings',
      icon: 'settings',
      route: `${Navigations.Admin}/${Navigations.Settings}`,
    },
    {
      label: 'AI Configuration',
      icon: 'smart_toy',
      route: `${Navigations.Admin}/${Navigations.AiConfig}`,
    },
    {
      label: 'Financial Management',
      icon: 'attach_money',
      route: `${Navigations.Admin}/${Navigations.Finance}`,
    },
    {
      label: 'Notification Center',
      icon: 'notifications',
      route: `${Navigations.Admin}/${Navigations.Notifications}`,
    },
  ],
};

export const PlateformName = 'QuizVerse';
