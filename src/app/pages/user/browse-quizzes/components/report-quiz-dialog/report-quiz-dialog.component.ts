import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { DynamicFormField } from '../../../../../shared/interfaces/dynamic-form-field.interface';
import {
  submitButton,
  cancelButton,
} from '../../../quiz-result-page/configs/quiz-result-buttons.configs';
import { reportQuestionFormField } from '../../../quiz-result-page/configs/report-question-form-field.config';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../../utils/constants';
import { BrowseQuizzesService } from '../../../../../services/user/browse-quizzes/browse-quizzes.service';

@Component({
  selector: 'app-report-quiz-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    OutlineButtonComponent,
    FilledButtonComponent,
    MatDialogModule,
  ],
  templateUrl: './report-quiz-dialog.component.html',
  styleUrl: './report-quiz-dialog.component.scss',
})
export class ReportQuizDialogComponent {
  @Output() reportSubmitted = new EventEmitter<boolean>();

  reportForm: FormGroup;
  formFields: DynamicFormField[] = reportQuestionFormField;
  submitButton = submitButton;
  cancelButton = cancelButton;

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ReportQuizDialogComponent>);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly snackbar = inject(SnackbarService);
  private readonly browseQuizService = inject(BrowseQuizzesService);

  private readonly destroy$ = new Subject<void>();

  quizTitle: string = this.data.quizTitle;
  quizId: number = this.data.quizId;
  reason: string = this.data.reason;

  ngOnInit(): void {
    this.reportForm = this.fb.group(
      this.formFields.reduce(
        (acc, field) => {
          acc[field.name] = ['', field.validators ?? []];
          return acc;
        },
        {} as Record<string, unknown>,
      ),
    );

    if (this.data.isEditMode) {
      this.patchValues();
    }
  }

  patchValues(): void {
    this.reportForm.patchValue({
      reason: this.data.reason || '',
    });
  }

  reportQuiz(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const reportData = {
      quizId: this.quizId,
      reason: this.reportForm.value.reason,
      reportId: this.data.reportId,
    };

    this.browseQuizService
      .reportQuiz(reportData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result) {
            this.snackbar.showSuccess(
              platformMessages.successTitle,
              platformMessages.successQuizReport,
            );
            this.reportSubmitted.emit(true);
            this.dialogRef.close(true);
          } else {
            this.snackbar.showError(
              platformMessages.errorTitle,
              platformMessages.failedToReportQuiz,
            );
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.failedToReportQuiz,
          );
        },
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getError(fieldName: string): string | null {
    const control = this.reportForm.get(fieldName);
    if (!control) return null;

    const field = this.formFields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages ?? {};

    return this.validationErrorService.getErrorMessage(control, messages, fieldName);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
