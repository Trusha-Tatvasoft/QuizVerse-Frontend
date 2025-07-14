import { TagColor } from '../../utils/types/tag-color.type';
import { TagType } from '../components/tag/tag.component';

export interface TagInputConfig {
  id: string;
  label: string;
  type: TagType;
  isSelected: boolean;
  hasBorder: boolean;
  backgroundColor: TagColor;
  textColor: TagColor;
}
