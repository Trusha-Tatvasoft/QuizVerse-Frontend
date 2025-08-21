import { TableData } from '../../../../../shared/interfaces/table-component.interface';
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
        backgroundColor: 'black',
        textColor: 'white',
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
      return { bg: 'lightBlue', text: 'blue' };
    case 2:
      return { bg: 'lightGreen', text: 'green' };
    case 3:
      return { bg: 'lightYellow', text: 'yellow' };
    default:
      return { bg: 'lightBrown', text: 'brown' };
  }
}
