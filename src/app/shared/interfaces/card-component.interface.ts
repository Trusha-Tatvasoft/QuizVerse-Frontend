import { CardColor } from '../../utils/types/card-component.type';
import { TagInputConfig } from './tag-component.interface';

export interface CardInputConfig {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  tag?: TagInputConfig;
  subtitleColor: CardColor;
  valueColor: CardColor;
  iconColor: CardColor;
}
