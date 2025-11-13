import { Component, inject, OnInit } from '@angular/core';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { dialogCloseCorrectly, platformMessages } from '../../../../../../utils/constants';
import { MatIcon } from '@angular/material/icon';
import {
  cancelButtonConfig,
  confirmUpdateQuestionButtonConfig,
} from '../../../configs/report-question-confirmation-dialog.config';
import { OutlineButtonComponent } from '../../../../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../../../../shared/components/filled-button/filled-button.component';
import { ReportedQuestionAction } from '../../../configs/report-question-table.config';
import { ReportQuestionsService } from '../../../../../../services/admin/content-moderation/report-questions.service';
import { AffectedQuizBattleCategoryGroup } from '../../../interfaces/report-question.interface';
import { CommonModule } from '@angular/common';
import { TagComponent } from '../../../../../../shared/components/tag/tag.component';
// import { mapToAffectedQuizBattleGroupedData } from './affected-quiz-battle.mapper';

@Component({
  selector: 'app-reported-questions-confirm-dialog',
  imports: [
    MatIcon,
    MatDialogModule,
    OutlineButtonComponent,
    FilledButtonComponent,
    CommonModule,
    TagComponent,
  ],
  templateUrl: './reported-questions-confirm-dialog.component.html',
  styleUrl: './reported-questions-confirm-dialog.component.scss',
})
export class ReportedQuestionsConfirmDialogComponent implements OnInit {
  groupedList: AffectedQuizBattleCategoryGroup[] = [];
  confirmUpdateBtn = confirmUpdateQuestionButtonConfig;
  cancelBtn = cancelButtonConfig;

  private readonly reportQuestionService = inject(ReportQuestionsService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialogRef = inject(MatDialogRef<ReportedQuestionsConfirmDialogComponent>);
  public readonly data = inject<ReportedQuestionAction>(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadAffectedData(this.data.questionId);
  }

  confirmAction() {
    this.updateQuestion();
  }

  updateQuestion() {
    const updateData = this.data.formData;
    const reportId = this.data.reportId;

    if (!updateData || !reportId) {
      this.snackbar.showError(platformMessages.errorTitle, platformMessages.errorMessage);
      this.dialog.closeAll();
      return;
    }

    this.reportQuestionService
      .UpdateReportedQuestion(reportId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result) {
            this.snackbar.showSuccess(platformMessages.successTitle, res.message);
            this.dialogRef.close(dialogCloseCorrectly);
          } else {
            this.snackbar.showError(platformMessages.errorTitle, res.message);
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
          this.dialogRef.close(dialogCloseCorrectly);
        },
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private loadAffectedData(questionId: number) {
    this.reportQuestionService
      .ActiveQuizBattleAffectedDTO(questionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result) {
            //  this.groupedList = mapToAffectedQuizBattleGroupedData(res.data || []);
          } else {
            this.snackbar.showError(platformMessages.errorTitle, res.message);
          }
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
