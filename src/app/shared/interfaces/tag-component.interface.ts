import { TagColor, TagType } from '../../utils/types/tag-component.type';

export interface TagInputConfig {
  id: string;
  label: string;
  type: TagType;
  isSelected: boolean;
  hasBorder: boolean;
  backgroundColor: TagColor;
  textColor: TagColor;
}
