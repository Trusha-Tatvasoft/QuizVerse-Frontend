import { ColumnDef, TableData } from '../../../../shared/interfaces/table-component.interface';
import { TablePaginationConfig } from '../../../../utils/constants';

// Configuration for user table columns
export const USER_TABLE_COLUMNS_CONFIG: ColumnDef[] = [
  {
    key: 'fullname',
    label: 'User',
    type: 'profile', // Custom profile cell type (e.g., name + email + avatar)
    isSortable: true,
  },
  {
    key: 'role',
    label: 'Role',
    type: 'tag', // Display as tag component
    isSortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'tag',
    isSortable: true,
  },
  {
    key: 'joinDate',
    label: 'Join Date',
    type: 'text',
    pipe: 'date', // Format date using Angular DatePipe
    pipeArgs: ['yyyy-MM-dd'],
    isSortable: true,
  },
  {
    key: 'lastActive',
    label: 'Last Active',
    type: 'text',
    pipe: 'date',
    pipeArgs: ['yyyy-MM-dd'],
    isSortable: true,
  },
  {
    key: 'attemptedQuizzes',
    label: 'Attempted Quizzes',
    type: 'tag',
    isSortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'button', // Action buttons (e.g., edit/delete)
    isSortable: false,
  },
];

// Pagination settings for user table
export const USER_TABLE_PAGINATION_CONFIG = {
  pageSize: TablePaginationConfig.PageSize, // Default page size
  pageSizeOptions: TablePaginationConfig.PageSizeOptions, // Options in paginator dropdown
  applyPaginator: true, // Enable pagination in the table
};
