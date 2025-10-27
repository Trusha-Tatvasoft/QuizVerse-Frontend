import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

export const battleHeaderConfig = {
  icon: 'sports_kabaddi',
  title: 'Battle Management',
  subtitle: 'Create and manage quiz battles',
  theme: 'user' as const,
};

export const createNewBattleConfig: ButtonConfig = {
  label: 'Create New Battle',
  variant: 'secondary',
  fontWeight: 500,
  matIcon: 'add',
  iconFontSet: 'material-icons',
};

export const deleteButtonConfig: ButtonConfig = {
  label: 'Delete',
  variant: 'secondary',
  fontWeight: 500,
  matIcon: 'delete',
  iconFontSet: 'material-icons-outlined',
};

export const editButtonConfig: ButtonConfig = {
  label: 'Edit',
  variant: 'secondary',
  fontWeight: 500,
  matIcon: 'edit',
  iconFontSet: 'material-icons-outlined',
};
