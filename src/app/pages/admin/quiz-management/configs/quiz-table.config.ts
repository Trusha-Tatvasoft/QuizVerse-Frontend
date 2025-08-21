import { ColumnDef } from '../../../../shared/interfaces/table-component.interface';
import { tablePaginationConfig } from '../../../../utils/constants';

// Configuration for quiz table columns
export const quizTableColumnsConfig: ColumnDef[] = [
  {
    key: 'quizTitle',
    label: 'Title',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'categoryName',
    label: 'Category',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'quizDifficultyLevel',
    label: 'Difficulty',
    type: 'tag', // Display as tag component
    isSortable: true,
  },
  {
    key: 'totalQuestion',
    label: 'Questions',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'noOfPersonAttempted',
    label: 'Participants',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'tag', // Display as tag component
    isSortable: true,
  },
  {
    key: 'createdDate',
    label: 'Created',
    type: 'text',
    pipe: 'date', // Format date using Angular DatePipe
    pipeArgs: ['yyyy-MM-dd'],
    isSortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'button', // Action buttons (e.g., edit/delete)
    isSortable: false,
  },
];

// Pagination settings for quiz table
export const quizTablePaginationConfig = {
  pageSize: tablePaginationConfig.PageSize, // Default page size
  pageSizeOptions: tablePaginationConfig.PageSizeOptions, // Options in paginator dropdown
  applyPaginator: true, // Enable pagination in the table
};
