import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';

export const correctAnswerTagConfig: TagInputConfig = {
  id: 'correct-answer',
  label: 'correct',
  type: 'static',
  isSelected: false,
  hasBorder: false,
  backgroundColor: 'lightGreen',
  textColor: 'green',
};

export const wrongAnswerTagConfig: TagInputConfig = {
  id: 'wrong-answer',
  label: 'wrong',
  type: 'static',
  isSelected: false,
  hasBorder: false,
  backgroundColor: 'lightRed',
  textColor: 'red',
};

export const notAttemptedTagConfig: TagInputConfig = {
  id: 'not-attempted',
  label: 'Not Attempted',
  type: 'static',
  isSelected: false,
  hasBorder: false,
  backgroundColor: 'lightOrange', // light gray background
  textColor: 'orange', // gray text
};
