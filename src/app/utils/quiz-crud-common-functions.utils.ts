import { TagInputConfig } from '../shared/interfaces/tag-component.interface';
import { TagColor } from './types/tag-component.type';

export function getTypeTagConfigWithLabel(label: string): TagInputConfig {
  return {
    id: label.toLowerCase(),
    label: label,
    type: 'static',
    isSelected: false,
    hasBorder: false,
    backgroundColor: 'white',
    textColor: 'black',
  };
}

export function getTagConfigWithDifficulty(q: string): TagInputConfig {
  let backgroundColor: TagColor;
  let textColor: TagColor;

  switch (q.toLowerCase()) {
    case 'easy':
      backgroundColor = 'lightGreen';
      textColor = 'green';
      break;
    case 'medium':
      backgroundColor = 'lightOrange';
      textColor = 'orange';
      break;
    case 'hard':
      backgroundColor = 'lightRed';
      textColor = 'red';
      break;
    default:
      backgroundColor = 'lightBlue';
      textColor = 'blue';
  }

  return {
    id: q.toLowerCase(),
    label: q,
    type: 'static',
    isSelected: false,
    hasBorder: false,
    backgroundColor,
    textColor,
  };
}

export function getTagConfigWithCustomization(
  lable: string,
  isBorder: boolean = false,
): TagInputConfig {
  return {
    id: lable.toLowerCase(),
    label: lable,
    type: 'static',
    isSelected: false,
    hasBorder: isBorder,
    backgroundColor: isBorder ? 'white' : 'black',
    textColor: !isBorder ? 'white' : 'black',
  };
}
