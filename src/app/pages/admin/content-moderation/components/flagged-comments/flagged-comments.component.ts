import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FlaggedCommentsTableComponent } from './flagged-comments-table/flagged-comments-table.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { FlaggedCommentsService } from '../../../../../services/admin/content-moderation/flagged-comments.service';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import {
  flaggedCommentsAction,
  platformMessages,
  tablePaginationConfig,
} from '../../../../../utils/constants';
import { QuizRatingStatus } from '../../../../../shared/enums/content-moderation.enum';
import { PaginationRequest } from '../../../../../shared/interfaces/pagination-request.interface';
import {
  FlaggedComments,
  UpdateFlaggedCommentStatusRequest,
} from '../../interfaces/flagged-comments.interface';
import { flaggedCommentsToTableData } from './flagged-comments-table/flagged-comments-table.mapper';
import { ConfirmationDialogData } from '../../../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  acceptedDialog,
  ignoredDialog,
} from '../../configs/flagged-comment-confirmation-dialog.config';
import { FlaggedCommentsPreviewDialogComponent } from './flagged-comments-preview-dialog/flagged-comments-preview-dialog.component';

@Component({
  selector: 'app-flagged-comments',
  imports: [MatSelectModule, FlaggedCommentsTableComponent],
  templateUrl: './flagged-comments.component.html',
  styleUrl: './flagged-comments.component.scss',
})
export class FlaggedCommentsComponent implements OnInit, OnDestroy {
  dialog = inject(MatDialog);

  //filters
  selectedStatus: number;
  selectedSeverity: number;

  // Table data
  dataSource = signal<TableData[]>([]);
  totalItems = signal(0);
  pagination = signal({ pageNumber: 1, pageSize: tablePaginationConfig.PageSize });
  sort = signal({ sortColumn: '', sortDescending: false });

  flaggedCommentStatus = Object.keys(QuizRatingStatus)
    .filter((key) => Number.isNaN(Number(key)))
    .map((key) => ({
      label: key,
      value: QuizRatingStatus[key as keyof typeof QuizRatingStatus],
    }));

  private readonly destroy$ = new Subject<void>();
  private readonly snackbar = inject(SnackbarService);
  private readonly flaggedCommentservice = inject(FlaggedCommentsService);

  ngOnInit(): void {
    this.getFlaggedCommmentsData();

    this.flaggedCommentservice.flaggedCommentUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((updated) => {
        if (updated) {
          this.getFlaggedCommmentsData();
          this.flaggedCommentservice.flaggedCommentUpdated$.next(false);
        }
      });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pagination.set({ pageNumber: event.pageIndex + 1, pageSize: event.pageSize });
    this.getFlaggedCommmentsData();
  }

  onSortChange(event: { active: string; direction: string }) {
    this.sort.set({
      sortColumn: event.active,
      sortDescending: event.direction === 'desc',
    });
    this.getFlaggedCommmentsData();
  }

  onFilterChange() {
    this.pagination.set({ ...this.pagination(), pageNumber: 1 });
    this.getFlaggedCommmentsData();
  }

  handleFlaggedCommentAction(event: { action: string; row: TableData }): void {
    const comment = event.row;

    switch (event.action) {
      case flaggedCommentsAction.VIEW: {
        this.loadFlaggedCommentPreview(Number(comment['id']));
        break;
      }
      case flaggedCommentsAction.ACCEPTED:
        this.openConfirmationDialog(acceptedDialog, () =>
          this.updateQueReportStatus(comment['id'] as number, QuizRatingStatus.Accepted),
        );
        break;
      case flaggedCommentsAction.IGNORED:
        this.openConfirmationDialog(ignoredDialog, () =>
          this.updateQueReportStatus(comment['id'] as number, QuizRatingStatus.Ignore),
        );
        break;
    }
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

  updateQueReportStatus(commentId: number, newStatus: QuizRatingStatus): void {
    const payload: UpdateFlaggedCommentStatusRequest = {
      id: commentId,
      status: newStatus,
    };
    this.flaggedCommentservice
      .updateAction(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.statusCode === 200) {
            this.snackbar.showSuccess(platformMessages.successTitle, res.message);
            this.getFlaggedCommmentsData();
          } else {
            this.snackbar.showError(platformMessages.errorTitle, res.message);
          }
        },
        error: (err) =>
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          ),
      });
  }

  loadFlaggedCommentPreview(commentId: number) {
    this.dialog.open(FlaggedCommentsPreviewDialogComponent, {
      width: '600px',
      maxHeight: '80vh',
      data: commentId,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getFlaggedCommmentsData(): void {
    const request: PaginationRequest = {
      ...this.pagination(),
      searchTerm: '',
      sortColumn: this.sort().sortColumn,
      sortDescending: this.sort().sortDescending,
      filters: {},
    };

    // Filter by severity
    if (this.selectedStatus) request.filters!['commentStatus'] = Number(this.selectedStatus);
    this.flaggedCommentservice
      .getFlaggedCommentsList(request)
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
          }
          const tableData = res.data.records.map((comment: FlaggedComments) =>
            flaggedCommentsToTableData(comment),
          );

          // Set data for your table
          this.dataSource.set(tableData);
          this.totalItems.set(res.data.totalRecords);
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }
}
