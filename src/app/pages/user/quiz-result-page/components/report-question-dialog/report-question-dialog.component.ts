import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { DynamicFormField } from '../../../../../shared/interfaces/dynamic-form-field.interface';
import { cancelButton, submitButton } from '../../configs/quiz-result-buttons.configs';
import { reportQuestionFormField } from '../../configs/report-question-form-field.config';
import { Subject } from 'rxjs';
import { ReportQuestionDialogData } from '../../interfaces/quiz-question-review.interface';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-report-question-dialog',
  standalone: true,
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
    MatTooltipModule,
  ],
  templateUrl: './report-question-dialog.component.html',
  styleUrls: ['./report-question-dialog.component.scss'],
})
export class ReportQuestionDialogComponent implements OnInit, OnDestroy {
  reportForm!: FormGroup;
  formFields: DynamicFormField[] = reportQuestionFormField;

  cancelButton = cancelButton;
  submitButton = { ...submitButton };
  disabledSubmitButton = { ...submitButton, isDisabled: true, label: 'Update Report' };

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ReportQuestionDialogComponent>);
  private readonly destroy$ = new Subject<void>();
  public readonly data = inject<ReportQuestionDialogData>(MAT_DIALOG_DATA);
  private readonly validationErrorService = inject(ValidationErrorService);

  ngOnInit(): void {
    this.reportForm?.reset();
    this.initForm();
  }

  onSubmit(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      reportId: this.data.reportId,
      questionId: this.data.questionId,
      description: this.reportForm.value.description,
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getError(fieldName: string): string | null {
    const control = this.reportForm.get(fieldName);
    const field = this.formFields.find((f) => f.name === fieldName);
    const customMessages = field?.validationMessages || {};

    return this.validationErrorService.getErrorMessage(control!, customMessages, fieldName);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    const formControls = this.formFields.reduce(
      (acc, field) => {
        acc[field.name] = ['', field.validators || []];
        return acc;
      },
      {} as Record<string, unknown>,
    );

    this.reportForm = this.fb.group(formControls);

    if (this.data.description) {
      this.reportForm.patchValue({ description: this.data.description });
    }

    // Disable form when not editable
    if (this.data.reportId !== null && !this.data.isEditable) {
      this.reportForm.disable();
    }

    // Update button label
    this.submitButton.label =
      this.data.reportId && this.data.isEditable ? 'Update Report' : 'Submit Report';
  }
}
