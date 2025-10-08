import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { UserListingComponent } from './components/user-table/user-listing.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { MatSelectModule } from '@angular/material/select';
import {
  addUserButtonConfig,
  exportButtonConfig,
  searchInputConfig,
  userHeaderConfig,
} from './configs/user-management.config';
import { FormControl } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { UserAction, UserRoles, UserStatus } from '../../../shared/enums/user-management.enum';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import { UserManagementService } from '../../../services/admin/user-management/user-management.service';
import { userToUserListingTableData } from './components/user-table/user-listing-data.mapper';
import {
  debounceTimeValue,
  platformMessages,
  tablePaginationConfig,
  userActionMessages,
  userActions,
  userExportFilePrefix,
  userSaveMessages,
} from '../../../utils/constants';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { generateExportFileName } from '../../../utils/generate-export-file-name.util';
import { UserFormDialogComponent } from './components/user-form-dialog/user-form-dialog.component';
import { UserFormData } from './interfaces/user-form-data.interface';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {
  activateUserDialog,
  deleteUserDialog,
  inactivateUserDialog,
  suspendUserDialog,
} from './configs/user-confirmation-dialog.config';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';

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
  dialog = inject(MatDialog);

  // Header and button configs
  userConfig = userHeaderConfig;
  searchInputConfig = searchInputConfig;
  addUserButtonConfig = addUserButtonConfig;
  exportButtonConfig = exportButtonConfig;

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
  pagination = signal({ pageNumber: 1, pageSize: tablePaginationConfig.PageSize });
  sort = signal({ sortColumn: '', sortDescending: false });

  // Private reactive helpers
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.getFilteredUser();
    this.fetchUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFilteredUser(): void {
    this.searchSubject.pipe(debounceTime(debounceTimeValue)).subscribe(() => {
      this.pagination.set({ ...this.pagination(), pageNumber: 1 });
      this.fetchUsers();
    });
  }

  onSearchInputChange(value: string): void {
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
              res.message || platformMessages.errorMessage,
              `${platformMessages.errorTitle} ${res.statusCode}`,
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
            this.snackbar.showError(platformMessages.noDataAvailable);
            return;
          }

          // Create a link element to download the blob as an Excel file
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = generateExportFileName(userExportFilePrefix);
          link.click();
          URL.revokeObjectURL(link.href);
        },
        error: async (err) => {
          if (err.error instanceof Blob) {
            try {
              // Attempt to parse the error response as JSON (Receive common api response as error)
              const errorText = await err.error.text();
              const errorJson = JSON.parse(errorText);
              this.snackbar.showError(errorJson.message || platformMessages.errorExport);
            } catch {
              this.snackbar.showError(platformMessages.errorExport);
            }
          } else {
            this.snackbar.showError(
              platformMessages.errorExport,
              err.message || platformMessages.errorExport,
            );
          }
        },
      });
  }

  openUserDialog(user: UserFormData | null = null): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      maxHeight: '95vh',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      autoFocus: false,
      data: user,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handleUserSave(result.formData, result.isEdit);
      }
    });
  }

  handleUserSave(userFormData: FormData, isEdit = false): void {
    this.userService
      .createOrUpdateUser(userFormData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const isSuccess = isEdit ? res.statusCode === 200 : res.statusCode === 201;
          const action = isEdit ? userSaveMessages.updated : userSaveMessages.created;

          if (isSuccess) {
            this.snackbar.showSuccess(
              userSaveMessages.successMessage(action),
              userSaveMessages.success,
            );
            this.fetchUsers();
          } else {
            this.snackbar.showError(
              res.message || userSaveMessages.errorMessage(action),
              `${userSaveMessages.error} ${res.statusCode}`,
            );
          }

          if (isSuccess) {
            this.fetchUsers();
          }
        },
        error: (err) => {
          this.snackbar.showError(
            err?.error?.message || userSaveMessages.serverError,
            userSaveMessages.error,
          );
        },
      });
  }

  handleUserAction(event: { action: string; row: TableData }): void {
    const user = event.row;
    switch (event.action) {
      case userActions.EDIT:
        this.loadUserForEdit(user['id'] as number);
        break;
      case userActions.DELETE:
        this.openConfirmationDialog(deleteUserDialog, () =>
          this.updateUserStatus(user['id'] as number, UserAction.Delete),
        );
        break;
      case userActions.BLOCK:
        this.openConfirmationDialog(suspendUserDialog, () =>
          this.updateUserStatus(
            user['id'] as number,
            UserAction.UpdateStatus,
            UserStatus.Suspended,
          ),
        );
        break;
      case userActions.ACTIVATE:
        this.openConfirmationDialog(activateUserDialog, () =>
          this.updateUserStatus(user['id'] as number, UserAction.UpdateStatus, UserStatus.Active),
        );
        break;
      case userActions.INACTIVATE:
        this.openConfirmationDialog(inactivateUserDialog, () =>
          this.updateUserStatus(user['id'] as number, UserAction.UpdateStatus, UserStatus.Inactive),
        );
        break;
    }
  }

  loadUserForEdit(userId: number): void {
    this.userService
      .getUserById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200 && res.data) {
            this.openUserDialog(res.data);
          } else {
            this.snackbar.showError(
              platformMessages.errorTitle,
              res.message || platformMessages.errorMessage,
            );
          }
        },
        error: (err) =>
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          ),
      });
  }

  openConfirmationDialog(dialogData: ConfirmationDialogData, onConfirm: () => void): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      disableClose: false,
      data: dialogData,
      panelClass: 'custom-dialog-radius',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) onConfirm();
    });
  }

  updateUserStatus(userId: number, action: UserAction, newStatus?: UserStatus): void {
    this.userService
      .updateUserStatusByAction({ id: userId, action, newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            if (action === UserAction.Delete) {
              const currentPage = this.pagination().pageNumber;
              const pageSize = this.pagination().pageSize;
              const totalItems = this.totalItems() - 1;

              const lastPage = Math.max(Math.ceil(totalItems / pageSize), 1);

              const newPage = Math.min(currentPage, lastPage);

              this.pagination.set({
                ...this.pagination(),
                pageNumber: newPage,
              });

              this.fetchUsers();
            }

            this.snackbar.showSuccess(
              platformMessages.successTitle,
              this.getActionMessage(action, newStatus),
            );
            this.fetchUsers();
          } else {
            this.snackbar.showError(
              platformMessages.errorTitle,
              res.message || platformMessages.errorMessage,
            );
          }
        },
        error: (err) =>
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          ),
      });
  }

  getActionMessage(action: UserAction, status?: UserStatus): string {
    if (action === UserAction.Delete) return userActionMessages.deleted;
    switch (status) {
      case UserStatus.Active:
        return userActionMessages.activated;
      case UserStatus.Suspended:
        return userActionMessages.suspended;
      case UserStatus.Inactive:
        return userActionMessages.inactivated;
      default:
        return userActionMessages.statusUpdated;
    }
  }
}
