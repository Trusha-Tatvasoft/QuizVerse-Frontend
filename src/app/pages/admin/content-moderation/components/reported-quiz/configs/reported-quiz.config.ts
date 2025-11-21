import { ColumnDef } from '../../../../../../shared/interfaces/table-component.interface';
import { reportedQuizSeverty, tablePaginationConfig } from '../../../../../../utils/constants';

//#region Reported Quiz Severity & Status Constants
export const reportedQuizSeverity = {
  high: 1,
  low: 2,
  mid: 3,
  underProcessing: 4,
} as const;

export const reportedQuizStatusLabel = {
  accepted: 1,
  ignore: 2,
  pending: 3,
  underReview: 4,
} as const;

export const severtyOptions = [
  { label: 'High', value: 1 },
  { label: 'Low', value: 2 },
  { label: 'Mid', value: 3 },
  { label: 'Under Processing', value: 4 },
];

export const statusOptions = [
  { label: 'Accepted', value: 1 },
  { label: 'Ignored', value: 2 },
  { label: 'Pending', value: 3 },
  { label: 'Under Review', value: 4 },
];

//#endregion

//#region Table Configuration
export const reportedQuizTableColumnsConfig: ColumnDef[] = [
  {
    key: 'quizTitle',
    label: 'Quiz',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'creator',
    label: 'Creator',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'reporter',
    label: 'Reporter',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'reason',
    label: 'Reason',
    type: 'text',
    isSortable: false,
  },
  {
    key: 'severity',
    label: 'Severity',
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
    key: 'actions',
    label: 'Actions',
    type: 'button',
    isSortable: false,
  },
];

export const reportedQuizTablePaginationConfig = {
  pageSize: tablePaginationConfig.PageSize,
  pageSizeOptions: tablePaginationConfig.PageSizeOptions,
  applyPaginator: true,
};

export const severityLabels: Record<number, string> = {
  [reportedQuizSeverty.high]: 'High',
  [reportedQuizSeverty.midium]: 'Medium',
  [reportedQuizSeverty.low]: 'Low',
  [reportedQuizSeverty.underProcessing]: 'Under Processing',
};

export const statusLabels: Record<number, string> = {
  [reportedQuizStatusLabel.accepted]: 'Accepted',
  [reportedQuizStatusLabel.ignore]: 'Ignored',
  [reportedQuizStatusLabel.pending]: 'Pending',
  [reportedQuizStatusLabel.underReview]: 'Under Review',
};

//#endregion
