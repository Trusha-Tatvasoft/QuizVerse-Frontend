import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableData } from '../../../../../../shared/interfaces/table-component.interface';
import {
  flaggedCommentsTableColumnsConfig,
  flaggedCommentsTablePaginationConfig,
} from '../../../configs/flagged-comments-table.config';
import { TableComponent } from '../../../../../../shared/components/table/table.component';

@Component({
  selector: 'app-flagged-comments-table',
  imports: [TableComponent],
  templateUrl: './flagged-comments-table.component.html',
  styleUrl: './flagged-comments-table.component.scss',
})
export class FlaggedCommentsTableComponent {
  @Input() dataSource: TableData[] = []; // Input data to be displayed in the table
  @Input() totalItems = 0; // Total number of items for pagination

  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>(); // Emits event when pagination changes
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>(); // Emits event when sorting changes
  @Output() actionClick = new EventEmitter<{ action: string; row: TableData }>(); // Emits event when any action button (edit/delete/block etc.) is clicked

  columns = flaggedCommentsTableColumnsConfig; // Table column configuration
  paginationConfig = flaggedCommentsTablePaginationConfig; // Pagination settings

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
