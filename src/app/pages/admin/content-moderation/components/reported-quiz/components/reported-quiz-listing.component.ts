import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableComponent } from '../../../../../../shared/components/table/table.component';
import {
  reportedQuizTableColumnsConfig,
  reportedQuizTablePaginationConfig,
} from '../configs/reported-quiz.config';
import { TableData } from '../../../../../../shared/interfaces/table-component.interface';

@Component({
  selector: 'app-reported-quizz-listing',
  imports: [TableComponent],
  templateUrl: './reported-quiz-listing.component.html',
  styleUrl: './reported-quiz-listing.component.scss',
})
export class ReportedQuizlistingComponent {
  @Input() dataSource: TableData[] = [];
  @Input() totalItems = 0;

  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() actionClick = new EventEmitter<{ action: string; row: TableData }>();

  columns = reportedQuizTableColumnsConfig;
  paginationConfig = reportedQuizTablePaginationConfig;

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
