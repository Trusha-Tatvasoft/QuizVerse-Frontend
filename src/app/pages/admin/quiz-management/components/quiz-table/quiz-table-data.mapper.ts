import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { color } from '../../../../../utils/constants';
import { QuizListData } from '../../interfaces/quiz-table-data.interface';

export function quizToQuizListingTableData(quiz: QuizListData): TableData {
  return {
    id: quiz.id,
    quiz_title: quiz.quizTitle,
    category_name: quiz.categoryName,
    quiz_difficulty_level: {
      tagConfig: {
        id: quiz.quizDifficultyLevel,
        label: quiz.quizDifficultyLevel,
        type: 'static',
        backgroundColor: color.black,
        textColor: color.white,
      },
    },
    total_question: quiz.totalQuestion,
    no_of_person_attempted: quiz.noOfPersonAttempted,
    status: {
      tagConfig: {
        id: quiz.status.toString(),
        label: getStatusLabel(quiz.status),
        type: 'static',
        backgroundColor: getStatusColor(quiz.status).bg,
        textColor: getStatusColor(quiz.status).text,
      },
    },
    created_date: quiz.createdDate,
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
      return { bg: color.lightBlue, text: color.blue };
    case 2:
      return { bg: color.lightGreen, text: color.green };
    case 3:
      return { bg: color.lightYellow, text: color.yellow };
    default:
      return { bg: color.lightBrown, text: color.brown };
  }
}
