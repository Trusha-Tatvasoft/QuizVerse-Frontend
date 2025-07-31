import { Component } from '@angular/core';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import {
  USER_TABLE_COLUMNS_CONFIG,
  USER_TABLE_DATA,
  USER_TABLE_PAGINATION_CONFIG,
} from '../../configs/user-table.config';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';

@Component({
  selector: 'app-user-table',
  imports: [TableComponent],
  templateUrl: './user-listing.component.html',
  styleUrls: ['./user-listing.component.scss'],
})
export class UserListingComponent {
  columns = USER_TABLE_COLUMNS_CONFIG;
  paginationConfig = USER_TABLE_PAGINATION_CONFIG;
  dataSource = USER_TABLE_DATA;
  tableTitle = 'All Users';
  tableDescription = 'Manage and monitor user accounts';

  totalItems = this.dataSource.length;

  onActionClick(event: { action: string; row: TableData }) {}

  onPageChange(event: { pageIndex: number; pageSize: number }) {}

  onSortChange(event: { active: string; direction: string }) {}
}
