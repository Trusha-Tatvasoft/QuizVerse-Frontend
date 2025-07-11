import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  TemplateRef,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ColumnDef, TableData, ActionIcon } from '../../interfaces/table.interface';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { TablePaginationConfig } from '../../../utils/constants';

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
  ],
})
export class TableComponent implements OnInit, OnChanges {
  @Input() columns: ColumnDef[] = [];
  @Input() dataSource: TableData[] = [];
  @Input() totalItems = TablePaginationConfig.TotalItems;
  @Input() pageSize = TablePaginationConfig.PageSize;
  @Input() pageSizeOptions: number[] = TablePaginationConfig.PageSizeOptions;
  @Input() actionIcons: ActionIcon[] = [];
  @Input() noDataMessage?: string;
  @Input() columnTemplates: { [key: string]: TemplateRef<any> } = {};
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource'] || changes['columns'] || changes['actionIcons']) {
      this.setDisplayedColumns();
    }

    if (this.dataSource && Array.isArray(this.dataSource)) {
      this.showPaginator = this.totalItems > this.pageSize;
    }
  }

  private setDisplayedColumns(): void {
    const updatedColumns = this.columns.map((col) => ({
      ...col,
      isSortable: col.isSortable ?? false,
    }));

    this.columns = updatedColumns;
    this.displayedColumns = updatedColumns.map((col) => col.key);

    if (this.actionIcons?.length) {
      this.displayedColumns.push('actions');
    }
  }

  onPageChange(event: any) {
    this.pageChange.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }

  onSortChange(sort: any) {
    this.sortChange.emit({ active: sort.active, direction: sort.direction });
  }

  onActionClick(action: string, row: TableData) {
    this.actionClick.emit({ action, row });
  }
}
