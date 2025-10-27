import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import {
  quizCategoryColumnConfig,
  quizCategoryPaginationConfig,
} from '../../configs/quiz-category-table.config';
import { TableComponent } from '../../../../../shared/components/table/table.component';

@Component({
  selector: 'app-quiz-category-table',
  imports: [TableComponent],
  templateUrl: './quiz-category-table.component.html',
  styleUrl: './quiz-category-table.component.scss',
})
export class QuizCategoryTableComponent {
  @Input() dataSource: TableData[] = []; // Input data to be displayed in the table
  @Input() totalItems = 0; // Total number of items

  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>(); // Emits event when pagination changes
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>(); // Emits event when sorting changes
  @Output() actionClick = new EventEmitter<{ action: string; row: TableData }>(); // Emits event when any action button is clicked

  columns = quizCategoryColumnConfig; // Table column configuration
  paginationConfig = quizCategoryPaginationConfig; // Pagination settings
  tableTitle = 'All Categories'; // Table metadata
  tableDescription = 'Manage quiz categories and their organization';

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
