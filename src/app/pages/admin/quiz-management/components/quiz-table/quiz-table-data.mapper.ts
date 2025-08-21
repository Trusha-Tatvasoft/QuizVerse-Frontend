import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { colors } from '../../../../../utils/constants';
import { QuizListData } from '../../interfaces/quiz-table-data.interface';

export function quizToQuizListingTableData(quiz: QuizListData): TableData {
  return {
    id: quiz.id,
    quizTitle: quiz.quizTitle,
    categoryName: quiz.categoryName,
    quizDifficultyLevel: {
      tagConfig: {
        id: quiz.quizDifficultyLevel,
        label: quiz.quizDifficultyLevel,
        type: 'static',
        backgroundColor: colors.black.bg,
        textColor: colors.black.text,
      },
    },
    totalQuestion: quiz.totalQuestion,
    noOfPersonAttempted: quiz.noOfPersonAttempted,
    status: {
      tagConfig: {
        id: quiz.status.toString(),
        label: getStatusLabel(quiz.status),
        type: 'static',
        backgroundColor: getStatusColor(quiz.status).bg,
        textColor: getStatusColor(quiz.status).text,
      },
    },
    createdDate: quiz.createdDate,
    actions: [
      { icon: 'visibility', tooltip: 'Preview Quiz' },
      { icon: 'edit', tooltip: 'Edit Quiz' },
      { icon: 'delete', tooltip: 'Delete Quiz' },
    ],
  };
}

function getStatusLabel(status: number): string {
  switch (status) {
    case 1:
      return 'Draft';
    case 2:
      return 'Active';
    case 3:
      return 'Inactive';
    default:
      return 'Unknown';
  }
}

function getStatusColor(status: number): { bg: string; text: string } {
  switch (status) {
    case 1:
      return colors.blue;
    case 2:
      return colors.green;
    case 3:
      return colors.yellow;
    default:
      return colors.brown;
  }
}
