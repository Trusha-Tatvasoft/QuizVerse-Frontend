import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuestionPoolService } from '../../../../../services/admin/question-pool/question-pool.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { TagColor } from '../../../../../utils/types/tag-component.type';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { QuestionDetail } from '../../interfaces/question-pool-preview.interface';
import { platformMessages } from '../../../../../utils/constants';
import { Subject, takeUntil } from 'rxjs';
import { getDifficultyColor } from '../question-pool-listing/question-pool-listing.mapper';

@Component({
  selector: 'app-question-preview-dialog',
  imports: [MatIconModule, MatChipsModule, CommonModule, TagComponent],
  templateUrl: './question-preview-dialog.component.html',
  styleUrls: ['./question-preview-dialog.component.scss'],
})
export class QuestionPreviewDialogComponent implements OnInit {
  private readonly questionPoolService = inject(QuestionPoolService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialogRef = inject(MatDialogRef<QuestionPreviewDialogComponent>);
  private readonly data = inject<{ id: number }>(MAT_DIALOG_DATA);

  questionData: QuestionDetail;

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.fetchQuestion();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getDifficultyTagConfig(difficulty: string): TagInputConfig {
    const colors = getDifficultyColor(difficulty);
    return {
      id: `tag-${difficulty.toLowerCase()}`,
      label: difficulty,
      type: 'static',
      isSelected: false,
      hasBorder: false,
      backgroundColor: colors.bg as TagColor,
      textColor: colors.text as TagColor,
    };
  }

  private fetchQuestion(): void {
    this.questionPoolService
      .getQuestionPreviewById(this.data.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.questionData = res.data;
        },
        error: (err) => {
          this.snackbar.showError(
            err?.error?.message || platformMessages.failedLoadQuesPreview,
            'Error',
          );
          this.dialogRef.close();
        },
      });
  }
}
