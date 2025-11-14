import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FilledButtonComponent } from '../../../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../../../shared/components/outline-button/outline-button.component';
import { cancelButtonConfig, submitButtonConfig } from '../../../../configs/question-pool.config';
import {
  QueOptionsAndAns,
  QuestionPoolListData,
} from '../../../../interfaces/question-pool-list-data.interface';
import { QuestionPoolService } from '../../../../../../../services/admin/question-pool/question-pool.service';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../../../../utils/constants';
import { ImportPreviewDialogData } from '../../../../interfaces/question-pool-ai-tab.interface';

@Component({
  selector: 'app-import-question-preview',
  imports: [
    MatDialogModule,
    MatIconModule,
    CommonModule,
    FilledButtonComponent,
    OutlineButtonComponent,
  ],
  templateUrl: './import-question-preview.component.html',
  styleUrl: './import-question-preview.component.scss',
})
export class ImportQuestionPreviewComponent {
  private readonly data = inject<ImportPreviewDialogData>(MAT_DIALOG_DATA);
  snackbar = inject(SnackbarService);
  submitBtn = submitButtonConfig;
  cancelBtn = cancelButtonConfig;
  questions: QuestionPoolListData[] = [...this.data.questions];
  isFromQuizCreation: boolean = this.data.isFromQuizCreation || false; 
  private readonly dialogRef = inject(MatDialogRef<ImportQuestionPreviewComponent>);
  private readonly questionPoolService = inject(QuestionPoolService);
  removeQuestion(index: number) {
    this.questions.splice(index, 1);
  }

  // --- UPDATED addQuestions() ---
  addQuestions() {
    if (this.questions.length === 0) {
      this.snackbar.showError(platformMessages.errorTitle, platformMessages.noQuestionsToSave);
      this.dialogRef.close(); // Close with no data
      return;
    }

    if (this.isFromQuizCreation) {
      // 1. From Quiz Creation: Just return the questions to the component that opened it
      this.dialogRef.close(this.questions);
    } else {
      // 2. From Question Pool: Save the questions to the database
      this.questionPoolService.saveQuestions(this.questions).subscribe({
        next: () => {
          this.snackbar.showSuccess(
            platformMessages.successTitle,
            platformMessages.saveQuestionsSuccess,
          );
          this.dialogRef.close(true); // Close with 'true' to indicate success
        },
        error: (err) => {
          const message = err?.error?.message || platformMessages.saveQuestionsFailure;
          this.snackbar.showError(platformMessages.errorTitle, message);
        },
      });
    }
  }

  hasOptions(options: QueOptionsAndAns[] | null | undefined): boolean {
    return options?.some((o) => o.key === 'option') ?? false;
  }

  getOptionsString(options: QueOptionsAndAns[]): string {
    return options
      .filter((o) => o.key === 'option')
      .map((o) => o.value)
      .join(', ');
  }

  getAnswerString(options: QueOptionsAndAns[]): string {
    return options
      .filter((o) => o.key === 'answer')
      .map((o) => o.value)
      .join(', ');
  }

  closeDialog() {
    this.dialogRef.close(false); // Close with 'false' to indicate cancellation
  }
}
