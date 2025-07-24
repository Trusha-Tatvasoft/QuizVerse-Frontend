import { CONFIG_ERROR } from 'storybook/internal/core-events';
import { ColumnDef } from '../../../../shared/interfaces/table-component.interface';
import { TablePaginationConfig } from '../../../../utils/constants';

export const USER_TABLE_COLUMNS_CONFIG: ColumnDef[] = [
  {
    key: 'user',
    label: 'User',
    type: 'profile',
    isSortable: true,
  },
  {
    key: 'role',
    label: 'Role',
    type: 'tag',
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
    pipe: 'date',
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
    type: 'button',
    isSortable: false,
  },
];

export const USER_TABLE_PAGINATION_CONFIG = {
  pageSize: TablePaginationConfig.PageSize,
  pageSizeOptions: TablePaginationConfig.PageSizeOptions,
  applyPaginator: true,
};
