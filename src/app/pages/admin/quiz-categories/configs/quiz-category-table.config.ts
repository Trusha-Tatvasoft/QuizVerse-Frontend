import { ColumnDef } from '../../../../shared/interfaces/table-component.interface';
import { tablePaginationConfig } from '../../../../utils/constants';

export const quizCategoryColumnConfig: ColumnDef[] = [
  {
    key: 'categoryName',
    label: 'Category',
    type: 'category', // icon + name
    isSortable: true,
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'quizCount',
    label: 'Quiz Count',
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
    key: 'createdDate',
    label: 'Created',
    type: 'text',
    pipe: 'date',
    pipeArgs: ['yyyy-MM-dd'],
    isSortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'button',
    isSortable: false,
  },
];

export const quizCategoryPaginationConfig = {
  pageSize: tablePaginationConfig.PageSize, // Default page size
  pageSizeOptions: tablePaginationConfig.PageSizeOptions, // Options in paginator dropdown
  applyPaginator: true, // Enable pagination in the table
};
