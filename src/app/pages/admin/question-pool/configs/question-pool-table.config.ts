import { ColumnDef } from '../../../../shared/interfaces/table-component.interface';
import { tablePaginationConfig } from '../../../../utils/constants';

export const questionPoolPaginationConfig = {
  pageSize: tablePaginationConfig.PageSize,
  pageSizeOptions: tablePaginationConfig.PageSizeOptions,
  applyPaginator: true,
};

export const questionPoolColumnsConfig: ColumnDef[] = [
  {
    key: 'queText',
    label: 'Question',
    type: 'question-pool',
    isSortable: true,
  },
  {
    key: 'queTypeName',
    label: 'Type',
    type: 'tag',
    isSortable: true,
  },
  {
    key: 'categoryName',
    label: 'Category',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'queDifficultyName',
    label: 'Difficulty',
    type: 'tag',
    isSortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'button',
    isSortable: false,
  },
];

export const questionPoolMockData: TableData[] = [
  {
    questionPool: [
      {
        question: 'What is the capital of France?',
        correctAnswer: 'Paris',
      },
    ],
    type: {
      tagConfig: {
        id: 'multiple-choice',
        label: 'Multiple Choice',
        backgroundColor: 'light-gray-color',
        textColor: 'black',
        hasBorder: true,
      },
    },
    category: 'Geography',
    difficulty: {
      tagConfig: {
        id: 'easy',
        label: 'Easy',
        backgroundColor: 'light-green',
        textColor: 'green',
      },
    },
    actions: [
      { icon: 'visibility', tooltip: 'View Question' },
      { icon: 'edit', tooltip: 'Edit Question' },
      { icon: 'delete', tooltip: 'Delete Question' },
    ],
  },
  {
    questionPool: [
      {
        question: 'What is 2 + 2?',
        correctAnswer: '4',
      },
    ],
    type: {
      tagConfig: {
        id: 'multiple-choice',
        label: 'Multiple Choice',
        backgroundColor: 'light-gray-color',
        textColor: 'black',
        hasBorder: true,
      },
    },
    category: 'Mathematics',
    difficulty: {
      tagConfig: {
        id: 'easy',
        label: 'Easy',
        backgroundColor: 'light-green',
        textColor: 'green',
      },
    },
    actions: [
      { icon: 'visibility', tooltip: 'View Question' },
      { icon: 'edit', tooltip: 'Edit Question' },
      { icon: 'delete', tooltip: 'Delete Question' },
    ],
  },
  {
    questionPool: [
      {
        question: 'What is the derivative of sin(x)?',
        correctAnswer: 'cos(x)',
      },
    ],
    type: {
      tagConfig: {
        id: 'multiple-choice',
        label: 'Multiple Choice',
        backgroundColor: 'light-gray-color',
        textColor: 'black',
        hasBorder: true,
      },
    },
    category: 'Calculus',
    difficulty: {
      tagConfig: {
        id: 'medium',
        label: 'Medium',
        backgroundColor: 'light-yellow',
        textColor: 'orange',
      },
    },
    actions: [
      { icon: 'visibility', tooltip: 'View Question' },
      { icon: 'edit', tooltip: 'Edit Question' },
      { icon: 'delete', tooltip: 'Delete Question' },
    ],
  },
  {
    questionPool: [
      {
        question: 'Explain the theory of relativity.',
        correctAnswer: 'E = mc² and more...',
      },
    ],
    type: {
      tagConfig: {
        id: 'descriptive',
        label: 'Descriptive',
        backgroundColor: 'light-gray-color',
        textColor: 'black',
        hasBorder: true,
      },
    },
    category: 'Physics',
    difficulty: {
      tagConfig: {
        id: 'hard',
        label: 'Hard',
        backgroundColor: 'light-red',
        textColor: 'red',
      },
    },
    actions: [
      { icon: 'visibility', tooltip: 'View Question' },
      { icon: 'edit', tooltip: 'Edit Question' },
      { icon: 'delete', tooltip: 'Delete Question' },
    ],
  },
];
