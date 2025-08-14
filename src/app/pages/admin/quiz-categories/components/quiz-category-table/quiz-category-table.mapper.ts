import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { QuizCategoryList } from '../../interface/quiz-category-list-data.interface';

/**
 * Maps a QuizCategoryDTO object from the API to a TableData format used by the table component.
 */
export function categoryToCategoryTableData(category: QuizCategoryList): TableData {
  return {
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
        id: category.isActive ? 'active' : 'inactive',
        label: category.isActive ? 'Active' : 'Inactive',
        type: 'static',
        backgroundColor: category.isActive ? 'lightGreen' : 'lightBrown',
        textColor: category.isActive ? 'green' : 'brown',
      },
    },
    createdDate: category.createdDate,
    actions: ['visibility', 'edit', 'delete'],
  };
}
