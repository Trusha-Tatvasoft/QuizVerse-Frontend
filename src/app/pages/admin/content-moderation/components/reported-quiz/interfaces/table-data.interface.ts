import { TagInputConfig } from '../../../../../../shared/interfaces/tag-component.interface';

export interface TableData {
  id: number;
  quizId: number;
  quizTitle: string;
  creator: string;
  reporter: string;
  reviewer: string;
  reason: string;
  createdDate: string;
  reviewedBy: string;
  severity: {
    tagConfig: TagInputConfig;
  };
  status: {
    tagConfig: TagInputConfig;
  };
  actions: TableAction[]; // <--- Typed actions list
}

export interface TableAction {
  icon: string;
  tooltip: string;
  isDisabled: boolean;
}
