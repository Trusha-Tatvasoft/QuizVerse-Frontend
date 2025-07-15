import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { ColumnDef, TableData, CurrencyValue } from '../../interfaces/table-component.interface';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { TablePaginationConfig } from '../../../utils/constants';
import { TagComponent } from '../tag/tag.component';
import { TextButtonComponent } from '../text-button/text-button.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    TagComponent,
    TextButtonComponent,
  ],
})
export class TableComponent implements OnInit, OnChanges {
  @Input() columns: ColumnDef[] = [];
  @Input() dataSource: TableData[] = [];
  @Input() totalItems = TablePaginationConfig.TotalItems;
  @Input() pageSize = TablePaginationConfig.PageSize;
  @Input() pageSizeOptions: number[] = TablePaginationConfig.PageSizeOptions;
  @Input() tableTitle?: string;
  @Input() tableDescription?: string;
  @Input() applyPaginator: boolean = true;

  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() actionClick = new EventEmitter<{ action: string; row: TableData }>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [];
  showPaginator: boolean = false;

  ngOnInit() {
    this.setDisplayedColumns();
  }

  // Update columns and displayed column keys if input data or columns change
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource'] || changes['columns']) {
      this.setDisplayedColumns();
    }

    // Determine whether to show paginator based on data size
    if (this.dataSource && Array.isArray(this.dataSource)) {
      this.showPaginator = this.totalItems > this.pageSize;
    }
  }

  public setDisplayedColumns(): void {
    const updatedColumns = this.columns.map((col) => ({
      ...col,
      isSortable: col.isSortable ?? false, // Default sorting for column set to false if undefined
    }));

    this.columns = updatedColumns;
    this.displayedColumns = updatedColumns.map((col) => col.key);
  }

  onPageChange(event: PageEvent) {
    this.pageChange.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }

  onSortChange(sort: Sort) {
    this.sortChange.emit({ active: sort.active, direction: sort.direction });
  }

  onActionClick(action: string, row: TableData) {
    this.actionClick.emit({ action, row });
  }

  /**
   * Extracts amount value from a number or CurrencyValue object
   */
  getAmount(value: CurrencyValue | number | null | undefined): number | null {
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object' && 'amount' in value) return value.amount;
    return null;
  }

  /**
   * Determines currency code to use for currency pipe
   */
  getCurrencyCodeFinal(
    value: CurrencyValue | number | null | undefined,
    column: ColumnDef,
  ): string {
    return (
      column.pipeArgs?.[0] || (typeof value === 'object' ? value?.currencyCode : undefined) || 'USD'
    );
  }

  /**
   * Determines currency display option (e.g. symbol/code)
   */
  getCurrencyDisplay(column: ColumnDef): string | boolean {
    return column.pipeArgs?.[1] ?? 'symbol';
  }

  /**
   * Determines currency digits info (e.g. 1.2-2)
   */
  getCurrencyDigits(column: ColumnDef): string {
    return column.pipeArgs?.[2] || '1.2-2';
  }
}
