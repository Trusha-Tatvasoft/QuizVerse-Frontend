import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { QuizCategoryList } from '../../interface/quiz-category-list-data.interface';

/**
 * Maps a QuizCategoryList object from the API to TableData format used by the table component.
 */
export function categoryToCategoryTableData(category: QuizCategoryList): TableData {
  const isActive = category.isActive;

  return {
    id: category.id,
    categoryName: {
      name: category.categoryName,
      icon: category.icon ?? 'category',
    },
    description: category.description,
    quizCount: {
      tagConfig: {
        id: `quizCount-${category.id}`,
        label: `${category.quizCount} quizzes`,
        type: 'static',
        backgroundColor: 'light-gray-color',
        textColor: 'black',
        hasBorder: true,
      },
    },
    status: {
      tagConfig: {
        id: isActive ? 'active' : 'inactive',
        label: isActive ? 'Active' : 'Inactive',
        type: 'static',
        backgroundColor: isActive ? 'lightGreen' : 'lightBrown',
        textColor: isActive ? 'green' : 'brown',
      },
    },
    createdDate: category.createdDate,
    actions: [
      'visibility',
      'edit',
      'delete',
      isActive ? 'remove_circle_outline' : 'check_circle_outline',
    ], // toggle action
  };
}
