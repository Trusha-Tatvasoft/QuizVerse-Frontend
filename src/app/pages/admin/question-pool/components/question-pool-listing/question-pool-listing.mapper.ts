import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { colors } from '../../../../../utils/constants';
import {
  QueOptionsAndAns,
  QuestionPoolListData,
} from '../../interfaces/question-pool-list-data.interface';

export function questionPoolToTableData(pool: QuestionPoolListData): TableData {
  return {
    id: pool.id,
    queText: {
      question: pool.queText,
      correctAnswer: getCorrectAnswer(pool.queOptionsAns),
    },
    queTypeName: {
      tagConfig: {
        id: pool.queTypeId,
        label: pool.queTypeName,
        backgroundColor: 'lightWhite',
        textColor: 'black',
        hasBorder: true,
      },
    },
    categoryName: pool.categoryName,
    queDifficultyName: {
      tagConfig: {
        id: pool.queDifficultyId,
        label: pool.queDifficultyName,
        backgroundColor: getDifficultyColor(pool.queDifficultyName).bg,
        textColor: getDifficultyColor(pool.queDifficultyName).text,
      },
    },
    actions: [
      { icon: 'visibility', tooltip: 'View Question' },
      { icon: 'edit', tooltip: 'Edit Question' },
      { icon: 'delete', tooltip: 'Delete Question' },
    ],
  };
}

function getCorrectAnswer(options: QueOptionsAndAns[]): string {
  const correctOption = options.find((opt) => opt.key.toLowerCase() === 'answer');
  return correctOption ? correctOption.value : 'N/A';
}

export function getDifficultyColor(difficulty: string): { bg: string; text: string } {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return colors.green;
    case 'medium':
      return colors.yellow;
    case 'hard':
      return colors.red;
    default:
      return colors.orange; // Fallback for unknown difficulties
  }
}
