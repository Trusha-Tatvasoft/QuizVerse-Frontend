import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { quizTableColumnsConfig, quizTablePaginationConfig } from '../../configs/quiz-table.config';

@Component({
  selector: 'app-quiz-table',
  imports: [TableComponent],
  templateUrl: './quiz-table.component.html',
  styleUrl: './quiz-table.component.scss',
})
export class QuizTableComponent {
  @Input() dataSource: TableData[] = []; // Input data to be displayed in the table
  @Input() totalItems = 0; // Total number of items for pagination

  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>(); // Emits event when pagination changes
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>(); // Emits event when sorting changes
  @Output() actionClick = new EventEmitter<{ action: string; row: TableData }>(); // Emits event when any action button (edit/delete/block etc.) is clicked

  columns = quizTableColumnsConfig; // Table column configuration
  paginationConfig = quizTablePaginationConfig; // Pagination settings
  tableTitle = 'All Quizzes'; // Table metadata
  tableDescription = 'Manage existing quizzes and their settings';

  // Emits the clicked action and row to the parent
  onActionClick(event: { action: string; row: TableData }) {
    this.actionClick.emit(event);
  }

  // Emits page change event to the parent
  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageChange.emit(event);
  }

  // Emits sort change event to the parent
  onSortChange(event: { active: string; direction: string }) {
    this.sortChange.emit(event);
  }
}
