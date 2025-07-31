import { Component, inject, signal } from '@angular/core';
import { UserListingComponent } from './components/user-table/user-listing.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { MatSelectModule } from '@angular/material/select';
import {
  ADD_USER_BUTTON_CONFIG,
  EXPORT_BUTTON_CONFIG,
  SEARCH_INPUT_CONFIG,
  USER_HEADER_CONFIG,
} from './configs/user-management.config';
import { FormControl } from '@angular/forms';
import { debounceTime, finalize } from 'rxjs';
import { UserRoles, UserStatus } from '../../../shared/enums/user-management.enum';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import { UserManagementService } from '../../../services/admin/user-management/user-management.service';
import { LoaderService } from '../../../shared/service/loader/loader.service';
import { userToUserListingTableData } from './components/user-table/user-listing-data.mapper';
import { TablePaginationConfig } from '../../../utils/constants';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    UserListingComponent,
    PageHeaderComponent,
    SearchInputComponent,
    MatSelectModule,
    OutlineButtonComponent,
    FilledButtonComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  // Header and button configs
  userConfig = USER_HEADER_CONFIG;
  searchInputConfig = SEARCH_INPUT_CONFIG;
  addUserButtonConfig = ADD_USER_BUTTON_CONFIG;
  exportButtonConfig = EXPORT_BUTTON_CONFIG;

  // Search input control
  searchControl = new FormControl<string | null>(null);

  // Filter selections
  selectedRole: number;
  selectedStatus: number;

  // Role and status filter dropdown options
  userRoles = Object.keys(UserRoles)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      label: key,
      value: UserRoles[key as keyof typeof UserRoles],
    }));

  userStatus = Object.keys(UserStatus)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      label: key,
      value: UserStatus[key as keyof typeof UserStatus],
    }));

  // Table data signals
  dataSource = signal<TableData[]>([]);
  totalItems = signal(0);
  pagination = signal({ pageNumber: 1, pageSize: TablePaginationConfig.PageSize });
  sort = signal({ sortColumn: '', sortDescending: false });

  // Inject services
  // constructor(private userService: UserManagementService) {}
  userService = inject(UserManagementService);
  loader = inject(LoaderService);

  ngOnInit(): void {
    // Debounced search input listener
    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.pagination.set({ ...this.pagination(), pageNumber: 1 });
      this.fetchUsers();
    });

    // Initial data fetch
    this.fetchUsers();
  }

  // Triggered on paginator change
  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pagination.set({ pageNumber: event.pageIndex + 1, pageSize: event.pageSize });
    this.fetchUsers();
  }

  // Triggered on table sort change
  onSortChange(event: { active: string; direction: string }) {
    this.sort.set({
      sortColumn: event.active,
      sortDescending: event.direction === 'desc',
    });
    this.fetchUsers();
  }

  // Triggered on role/status filter change
  onFilterChange() {
    this.pagination.set({ ...this.pagination(), pageNumber: 1 });
    this.fetchUsers();
  }

  // Fetch user list with filters, sort, pagination
  fetchUsers() {
    this.loader.show();

    const request: PaginationRequest = {
      ...this.pagination(),
      searchTerm: this.searchControl.value ?? '',
      sortColumn: this.sort().sortColumn,
      sortDescending: this.sort().sortDescending,
      filters: {},
    };

    // Apply filters if selected
    if (this.selectedRole) request.filters!['role'] = Number(this.selectedRole);
    if (this.selectedStatus) request.filters!['status'] = Number(this.selectedStatus);

    this.userService
      .getUsers(request)
      .pipe(finalize(() => this.loader.hide()))
      .subscribe((res) => {
        this.dataSource.set(res.records.map(userToUserListingTableData));
        this.totalItems.set(res.totalRecords);
      });
  }
}
