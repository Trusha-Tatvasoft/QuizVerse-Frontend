import { categoryToCategoryTableData } from './quiz-category-table.mapper';
import { QuizCategoryList } from '../../interface/quiz-category-list-data.interface';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';

describe('categoryToCategoryTableData', () => {
  it('should map a QuizCategoryList object to TableData correctly', () => {
    const input: QuizCategoryList = {
      id: 1,
      categoryName: 'Science',
      description: 'Science quizzes',
      quizCount: 5,
      isActive: true,
      createdDate: '2025-08-06T00:00:00Z',
      icon: 'science',
    };

    const result: TableData = categoryToCategoryTableData(input);

    expect(result).toEqual({
      categoryName: {
        name: 'Science',
        icon: 'science',
      },
      description: 'Science quizzes',
      quizCount: {
        tagConfig: {
          id: 'quizCount-1',
          label: '5 quizzes',
          type: 'static',
          backgroundColor: 'light-gray-color',
          textColor: 'black',
          hasBorder: true,
        },
      },
      status: {
        tagConfig: {
          id: 'active',
          label: 'Active',
          type: 'static',
          backgroundColor: 'lightGreen',
          textColor: 'green',
        },
      },
      createdDate: '2025-08-06T00:00:00Z',
      actions: [
        { icon: 'visibility', tooltip: 'View Category' },
        { icon: 'edit', tooltip: 'Edit Category' },
        { icon: 'delete', tooltip: 'Delete Category' },
      ],
    });
  });

  it('should fallback to default icon if icon is null', () => {
    const input: QuizCategoryList = {
      id: 2,
      categoryName: 'Math',
      description: 'Math quizzes',
      quizCount: 10,
      isActive: false,
      createdDate: '2025-08-01T00:00:00Z',
      icon: null, // this is important
    };

    const result = categoryToCategoryTableData(input);
    expect((result['categoryName'] as any).icon).toBe('category');
    expect((result['status'] as any).tagConfig.id).toBe('inactive');
    expect((result['status'] as any).tagConfig.label).toBe('Inactive');
  });
});
