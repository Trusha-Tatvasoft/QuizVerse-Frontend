import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

export const quickBattleButtonConfig: ButtonConfig = {
  label: 'Quick Battle',
  variant: 'secondary',
  matIcon: 'bolt',
  imagePosition: 'left',
};

export const challengeFriendButtonConfig: ButtonConfig = {
  label: 'Challenge Friend',
  variant: 'secondary',
  matIcon: 'sports_kabaddi',
  imagePosition: 'left',
};

export const waitingResultButtonConfig: ButtonConfig = {
  label: 'Waiting for Result…',
  variant: 'secondary',
  matIcon: 'hourglass_empty',
  imagePosition: 'left',
};

export const loadMoreButtonConfig: ButtonConfig = {
  label: 'Load More',
  variant: 'primary',
  fontWeight: 500,
};
