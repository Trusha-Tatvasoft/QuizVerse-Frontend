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
  private readonly dialogRef = inject(MatDialogRef<ImportQuestionPreviewComponent>);
  private readonly data = inject<QuestionPoolListData[]>(MAT_DIALOG_DATA);
  private readonly questionPoolService = inject(QuestionPoolService);
  snackbar = inject(SnackbarService);

  submitBtn = submitButtonConfig;
  cancelBtn = cancelButtonConfig;

  questions: QuestionPoolListData[] = [...this.data];

  removeQuestion(index: number) {
    this.questions.splice(index, 1);
  }
  addQuestions() {
    if (this.questions.length === 0) {
      this.snackbar.showError('Error', platformMessages.noQuestionsToSave);
      this.dialogRef.close();
      return;
    }

    this.questionPoolService.saveQuestions(this.questions).subscribe({
      next: () => {
        this.snackbar.showSuccess('Success', platformMessages.saveQuestionsSuccess);
        this.dialogRef.close(true);
      },
      error: (err) => {
        const message = err?.error?.message || platformMessages.saveQuestionsFailure;
        this.snackbar.showError('Error', message);
      },
    });
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
    this.dialogRef.close();
  }
}
