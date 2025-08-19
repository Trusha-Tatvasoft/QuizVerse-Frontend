import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import {
  questionPoolColumnsConfig,
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
  @Input() dataSource: TableData[] = [];
  @Input() totalItems = 0;

  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() actionClick = new EventEmitter<{ action: string; row: TableData }>();

  columns = questionPoolColumnsConfig;
  paginationConfig = questionPoolPaginationConfig;

  // Dynamic title that updates whenever dataSource changes
  get tableTitle(): string {
    return `Question Pool (${this.totalItems || this.dataSource.length})`;
  }

  tableDescription = 'Manage and organize questions for quizzes and battles';

  onActionClick(event: { action: string; row: TableData }) {
    this.actionClick.emit(event);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageChange.emit(event);
  }

  onSortChange(event: { active: string; direction: string }) {
    this.sortChange.emit(event);
  }
}
