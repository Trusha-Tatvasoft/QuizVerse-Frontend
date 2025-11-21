import { ColumnDef } from '../../../../shared/interfaces/table-component.interface';
import { tablePaginationConfig } from '../../../../utils/constants';
import { QuestionRequest } from '../../question-pool/interfaces/question-request.interface';

//#region Table Configuration
export const reportedQuestionTableColumnsConfig: ColumnDef[] = [
  {
    key: 'question',
    label: 'Question',
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
    isSortable: true,
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
    key: 'createddate',
    label: 'Created Date',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'button',
    isSortable: false,
  },
];
//#endregion

export const reportedQuestionTablePaginationConfig = {
  pageSize: tablePaginationConfig.PageSize,
  pageSizeOptions: tablePaginationConfig.PageSizeOptions,
  applyPaginator: true,
};

export interface ReportedQuestionAction {
  questionId: number;
  reportId?: number;
  formData?: QuestionRequest;
}
