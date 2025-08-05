import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { UserRoles, UserStatus } from '../../../shared/enums/user-management.enum';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import { UserManagementService } from '../../../services/admin/user-management/user-management.service';
import { userToUserListingTableData } from './components/user-table/user-listing-data.mapper';
import {
  DEBOUNCE_TIME,
  PlatformMessages,
  TablePaginationConfig,
  USER_EXPORT_FILE_PREFIX,
} from '../../../utils/constants';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { generateExportFileName } from '../../../utils/generate-export-file-name.util';

@Component({
  selector: 'app-user-management',
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
export class UserManagementComponent implements OnInit, OnDestroy {
  // Inject services
  userService = inject(UserManagementService);
  snackbar = inject(SnackbarService);

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

  // Private reactive helpers
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Initial data fetch
    this.fetchUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFilteredUser(): void {
    this.searchSubject.pipe(debounceTime(DEBOUNCE_TIME)).subscribe(() => {
      this.pagination.set({ ...this.pagination(), pageNumber: 1 });
      this.fetchUsers();
    });
  }

  onSearchInputChange(value: string): void {
    this.getFilteredUser();
    this.searchSubject.next(value);
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200) {
            this.snackbar.showError(
              res.message || PlatformMessages.errorMessage,
              `${PlatformMessages.errorTitle} ${res.statusCode}`,
            );
            this.dataSource.set([]);
            this.totalItems.set(0);
            return;
          }
          this.dataSource.set(res.data.records.map(userToUserListingTableData));
          this.totalItems.set(res.data.totalRecords);
        },
        error: (error) => {
          const message = error?.error?.message || error?.message || 'Unexpected error occurred';
          const status = error?.status || 'Unknown';
          this.snackbar.showError(message, `Error ${status}`);
        },
      });
  }

  exportUsers() {
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
      .exportUsersToExcel(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          if (blob.size === 0) {
            this.snackbar.showError(PlatformMessages.noDataAvailable);
            return;
          }

          // Create a link element to download the blob as an Excel file
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = generateExportFileName(USER_EXPORT_FILE_PREFIX);
          link.click();
          URL.revokeObjectURL(link.href);
        },
        error: async (err) => {
          if (err.error instanceof Blob) {
            try {
              // Attempt to parse the error response as JSON (Receive common api response as error)
              const errorText = await err.error.text();
              const errorJson = JSON.parse(errorText);
              this.snackbar.showError(errorJson.message || PlatformMessages.errorExport);
            } catch (parseError) {
              this.snackbar.showError(PlatformMessages.errorExport);
            }
          } else {
            this.snackbar.showError(
              PlatformMessages.errorExport,
              err.message || PlatformMessages.errorExport,
            );
          }
        },
      });
  }
}
