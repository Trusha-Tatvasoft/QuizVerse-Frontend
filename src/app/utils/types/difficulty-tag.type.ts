import { TagInputConfig } from '../../shared/interfaces/tag-component.interface';

export function createDifficultyTag(difficulty: string): TagInputConfig {
  return {
    id: difficulty,
    label: difficulty,
    type: 'static',
    isSelected: false,
    hasBorder: false,
    backgroundColor: 'lightWhite',
    textColor: 'black',
  };
}
