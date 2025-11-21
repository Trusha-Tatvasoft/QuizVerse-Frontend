import { Component, HostListener, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FlaggedCommentsService } from '../../../../../../services/admin/content-moderation/flagged-comments.service';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  FlaggedCommentView,
  UpdateFlaggedCommentStatusRequest,
} from '../../../interfaces/flagged-comments.interface';
import { Subject, takeUntil } from 'rxjs';
import { flaggedCommentsAction, platformMessages } from '../../../../../../utils/constants';
import { TagInputConfig } from '../../../../../../shared/interfaces/tag-component.interface';
import {
  getStatusColor,
  getStatusLabel,
} from '../flagged-comments-table/flagged-comments-table.mapper';
import { TagColor } from '../../../../../../utils/types/tag-component.type';
import {
  globalGetInitials,
  globalGetInitialsColorClass,
} from '../../../../../../utils/get-profile-initials.utils';
import { TagComponent } from '../../../../../../shared/components/tag/tag.component';
import { FilledButtonComponent } from '../../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../../shared/components/outline-button/outline-button.component';
import { CommonModule } from '@angular/common';
import {
  acceptedDialog,
  acceptReportButtonConfig,
  acceptReportForDialogButtonConfig,
  cancelButtonConfig,
  closeButtonConfig,
  ignoreButtonConfig,
  ignoredDialog,
  ignoreReportForDialogButtonConfig,
} from '../../../configs/flagged-comment-confirmation-dialog.config';
import { MatIcon } from '@angular/material/icon';
import { QuizRatingStatus } from '../../../../../../shared/enums/content-moderation.enum';
import { ConfirmationDialogData } from '../../../../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-flagged-comments-preview-dialog',
  imports: [TagComponent, FilledButtonComponent, OutlineButtonComponent, CommonModule, MatIcon],
  templateUrl: './flagged-comments-preview-dialog.component.html',
  styleUrl: './flagged-comments-preview-dialog.component.scss',
})
export class FlaggedCommentsPreviewDialogComponent implements OnInit, OnDestroy {
  flaggedCommentData: FlaggedCommentView;
  acceptReportButtonConfig = { ...acceptReportForDialogButtonConfig };
  ignoreReportButtonConfig = { ...ignoreReportForDialogButtonConfig };
  closeButtonConfig = closeButtonConfig;
  dialog = inject(MatDialog);
  quizRatingStatus = QuizRatingStatus;
  private readonly flaggedCommentService = inject(FlaggedCommentsService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialogRef = inject(MatDialogRef<FlaggedCommentsPreviewDialogComponent>);
  private readonly data = inject<number>(MAT_DIALOG_DATA);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadflaggedCommentPreviewData(this.data);
  }

  loadflaggedCommentPreviewData(commentId: number): void {
    this.flaggedCommentService
      .getFlaggedCommentsPreviewById(commentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.statusCode === 200) {
            this.flaggedCommentData = res.data;
          } else {
            this.snackbar.showError(
              platformMessages.errorTitle,
              platformMessages.failedToLoadCommentPreview,
            );
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.failedToLoadCommentPreview,
          );
        },
      });
  }

  getFlaggedCommentStatusConfig(status: number): TagInputConfig {
    const colors = getStatusColor(status);
    return {
      id: `${status}`,
      label: getStatusLabel(status),
      type: 'static',
      isSelected: false,
      hasBorder: false,
      backgroundColor: colors.bg as TagColor,
      textColor: colors.text as TagColor,
    };
  }

  // Return initials for a given name
  getInitials(name: string): string {
    return globalGetInitials(name);
  }

  // Return color class for user avatar based on name hash
  getInitialsColorClass(name: string): string {
    return globalGetInitialsColorClass(name);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  handleFlaggedCommentAction(commentId: number, event: number): void {
    switch (event) {
      case QuizRatingStatus.Accepted:
        this.openConfirmationDialog(acceptedDialog, () =>
          this.updateQueReportStatus(commentId as number, QuizRatingStatus.Accepted),
        );
        break;
      case QuizRatingStatus.Ignore:
        this.openConfirmationDialog(ignoredDialog, () =>
          this.updateQueReportStatus(commentId as number, QuizRatingStatus.Ignore),
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
    this.flaggedCommentService
      .updateAction(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.statusCode === 200) {
            this.snackbar.showSuccess(platformMessages.successTitle, res.message);
            this.loadflaggedCommentPreviewData(this.data);
            this.flaggedCommentService.notifyFlaggedCommentUpdated();
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
