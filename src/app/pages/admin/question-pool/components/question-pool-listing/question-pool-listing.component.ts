import { Component } from '@angular/core';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import {
  questionPoolColumnsConfig,
  questionPoolMockData,
  questionPoolPaginationConfig,
} from '../../configs/question-pool-table.config';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';

@Component({
  selector: 'app-question-pool-table',
  imports: [TableComponent],
  templateUrl: './question-pool-listing.component.html',
  styleUrl: './question-pool-listing.component.scss',
})
export class QuestionPoolListingComponent {
  columns = questionPoolColumnsConfig;
  paginationConfig = questionPoolPaginationConfig;
  dataSource = questionPoolMockData;
  totalItems = this.dataSource.length;
  tableTitle = 'Question Pool (' + this.totalItems + ')';
  tableDescription = 'Manage and organize questions for quizzes and battles';

  onActionClick(event: { action: string; row: TableData }) {}

  onPageChange(event: { pageIndex: number; pageSize: number }) {}

  onSortChange(event: { active: string; direction: string }) {}
}
