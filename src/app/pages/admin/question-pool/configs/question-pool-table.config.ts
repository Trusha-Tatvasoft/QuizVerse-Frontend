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
