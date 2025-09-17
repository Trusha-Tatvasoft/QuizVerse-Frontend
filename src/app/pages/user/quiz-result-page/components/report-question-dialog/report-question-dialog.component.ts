import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  ],
  templateUrl: './report-question-dialog.component.html',
  styleUrls: ['./report-question-dialog.component.scss'],
})
export class ReportQuestionDialogComponent implements OnInit, OnDestroy {
  @Input() questionId!: number;
  @Input() questionText!: string;

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ReportQuestionDialogComponent>);
  private readonly destroy$ = new Subject<void>();

  reportForm: FormGroup;
  formFields: DynamicFormField[] = reportQuestionFormField;
  submitButton = submitButton;
  cancelButton = cancelButton;

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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Submit handler */
  onSubmit(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      questionId: this.questionId,
      questionText: this.questionText,
      ...this.reportForm.value,
    });
  }

  /** Cancel handler */
  onCancel(): void {
    this.dialogRef.close();
  }

  /** Error message resolver */
  getError(fieldName: string): string {
    const field = this.formFields.find((f) => f.name === fieldName);
    const control = this.reportForm.get(fieldName);

    if (!field || !control || !control.errors || !control.touched) return '';

    return (
      Object.keys(control.errors)
        .map((key) => field.validationMessages?.[key])
        .find(Boolean) || `${field.label || field.name} is invalid`
    );
  }
}
