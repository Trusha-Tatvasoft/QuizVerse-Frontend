import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';
import { LandingPageConfig } from '../interfaces/landing-page.interface';

export const LANDING_PAGE_CONTENT: LandingPageConfig = {
  quote:
    'Create, share, and compete in quizzes powered by AI. Challenge friends, join tournaments, and climb the leaderboards in the ultimate quiz experience.',
  stats: [
    { value: '50K+', label: 'Active Players' },
    { value: '1M+', label: 'Quizzes Created' },
    { value: '10M+', label: 'Questions Answered' },
    { value: '500+', label: 'Daily Tournaments' },
  ],
};

export const FEATURES = [
  {
    title: 'AI-Generated Quizzes',
    description: 'Create quizzes instantly from PDFs, text, or URLs using advanced AI technology.',
    icon: 'psychology',
  },
  {
    title: 'Multiplayer Battles',
    description: 'Challenge friends or random opponents in real-time quiz battles.',
    icon: 'group',
  },
  {
    title: 'Tournaments & Contests',
    description: 'Participate in competitive tournaments with prizes and rankings.',
    icon: 'emoji_events',
  },
  {
    title: 'Skill-Based Matching',
    description: 'Get matched with players of similar skill levels for fair competition.',
    icon: 'track_changes',
  },
];
export const START_PLAY_BUTTON: ButtonConfig = {
  label: 'Start Playing Now',
  matIcon: 'play_arrow',
  iconFontSet: 'material-icons',
  imagePosition: 'left',
  variant: 'gradient',
};

export const BROWSE_QUIZZES_BUTTON: ButtonConfig = {
  label: 'Browse Quizzes',
  matIcon: 'import_contacts',
  iconFontSet: 'material-icons',
  imagePosition: 'left',
};

export const JOIN_PLATFORM_BUTTON: ButtonConfig = {
  label: 'Join QuizzVerse Today',
  matIcon: 'arrow_forward',
  iconFontSet: 'material-icons',
  fontWeight: 500,
  imagePosition: 'right',
};
