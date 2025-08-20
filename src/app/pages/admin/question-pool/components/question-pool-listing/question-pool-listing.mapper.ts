import { TableData } from '../../../../../shared/interfaces/table-component.interface';
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
        backgroundColor: 'light-gray-color',
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

function getDifficultyColor(difficulty: string): { bg: string; text: string } {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return { bg: 'light-green', text: 'green' };
    case 'medium':
      return { bg: 'light-yellow', text: 'yellow' };
    case 'hard':
      return { bg: 'light-red', text: 'red' };
    default:
      return { bg: 'light-orange', text: 'orange' };
  }
}
