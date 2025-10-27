import { QuizStatus } from '../../../../../shared/enums/quiz-management.enum';
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
      ...(quiz.status !== QuizStatus.Draft
        ? [
            {
              icon:
                quiz.status === QuizStatus.Active
                  ? 'remove_circle_outline'
                  : 'check_circle_outline',
              tooltip: quiz.status === QuizStatus.Active ? 'Deactivate Quiz' : 'Activate Quiz',
            },
          ]
        : []),
    ],
  };
}

function getStatusLabel(status: number): string {
  switch (status) {
    case 1:
      return 'Active';
    case 2:
      return 'Draft';
    case 3:
      return 'Inactive';
    default:
      return 'Unknown';
  }
}

function getStatusColor(status: number): { bg: string; text: string } {
  switch (status) {
    case 1:
      return colors.green;
    case 2:
      return colors.blue;
    case 3:
      return colors.yellow;
    default:
      return colors.brown;
  }
}
