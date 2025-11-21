import { ColumnDef } from '../../../../shared/interfaces/table-component.interface';
import { tablePaginationConfig } from '../../../../utils/constants';

//#region Table Configuration
export const flaggedCommentsTableColumnsConfig: ColumnDef[] = [
  {
    key: 'comment',
    label: 'Comments',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'author',
    label: 'Author',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'quizName',
    label: 'Quiz Name',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'reason',
    label: 'Reason',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'date',
    label: 'Date',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'status',
    label: 'Status',
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

export const flaggedCommentsTablePaginationConfig = {
  pageSize: tablePaginationConfig.PageSize,
  pageSizeOptions: tablePaginationConfig.PageSizeOptions,
  applyPaginator: true,
};
