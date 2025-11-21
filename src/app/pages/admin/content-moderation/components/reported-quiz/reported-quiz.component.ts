import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { platformMessages } from '../../../../../utils/constants';
import { ContentModerationService } from '../../../../../services/admin/content-moderation/content-moderation.service';
import { ConfirmationDialogData } from '../../../../../shared/interfaces/confirmation-dialog.interface';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { Role } from '../../../../../shared/enums/role';
import { severtyOptions, statusOptions } from './configs/reported-quiz.config';
import { reportedQuizToTableData } from './components/reported-quiz-listing.mapper';
import { ReportedQuizlistingComponent } from './components/reported-quiz-listing.component';

@Component({
  selector: 'app-reported-quiz',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, ReportedQuizlistingComponent],
  templateUrl: './reported-quiz.component.html',
  styleUrls: ['./reported-quiz.component.scss'],
})
export class ReportedQuizComponent implements OnInit, OnDestroy {
  private readonly snackbar = inject(SnackbarService);
  private readonly reportedQuizService = inject(ContentModerationService);
  private readonly authService = inject(AuthService);

  searchControl = new FormControl<string | null>(null);
  dialog = inject(MatDialog);
  selectedSeverity!: number | null;
  selectedStatus!: number | null;
  loggedInUserId: number;
  isSuperAdmin: boolean;

  severtyOptions = severtyOptions;
  selectOptions = statusOptions;

  dataSource = signal<TableData[]>([]);
  totalItems = signal(0);
  pagination = signal({ pageNumber: 1, pageSize: 5 });
  sort = signal({ sortColumn: '', sortDescending: false });

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    this.loggedInUserId = userId ? Number(userId) : 0;
    const role = this.authService.getRoleFromToken(this.authService.getAccessToken()!);
    this.isSuperAdmin = role ? role === Role.SuperAdmin : false;
    this.fetchReportedQuizzes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pagination.set({ pageNumber: event.pageIndex + 1, pageSize: event.pageSize });
    this.fetchReportedQuizzes();
  }

  onSortChange(event: { active: string; direction: string }) {
    this.sort.set({
      sortColumn: event.active,
      sortDescending: event.direction === 'desc',
    });
    this.fetchReportedQuizzes();
  }

  onFilterChange() {
    this.pagination.set({ ...this.pagination(), pageNumber: 1 });
    this.fetchReportedQuizzes();
  }

  fetchReportedQuizzes() {
    const request = {
      pageNumber: this.pagination().pageNumber,
      pageSize: this.pagination().pageSize,
      searchText: this.searchControl.value ?? '',
      sortColumn: this.sort().sortColumn,
      sortDescending: this.sort().sortDescending,
      filters: {} as { [key: string]: number },
    };

    if (this.selectedSeverity !== null && this.selectedSeverity !== undefined) {
      request.filters['issueReportSeverity'] = Number(this.selectedSeverity);
    }

    if (this.selectedStatus !== null && this.selectedStatus !== undefined) {
      request.filters['issueReportStatus'] = Number(this.selectedStatus);
    }

    this.reportedQuizService
      .getReportedQuizList(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const { totalRecords, records } = response.data;
          this.totalItems.set(totalRecords);
          const mappedData = records.map((quiz) =>
            reportedQuizToTableData(quiz, this.loggedInUserId, this.isSuperAdmin),
          );
          this.dataSource.set(mappedData);
        },
        error: () =>
          this.snackbar.showError(
            platformMessages.errorMessage,
            platformMessages.failToLoadReportedQuizList,
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
}
