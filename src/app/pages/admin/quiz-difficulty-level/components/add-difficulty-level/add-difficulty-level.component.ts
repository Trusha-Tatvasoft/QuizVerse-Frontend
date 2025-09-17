import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import {
  addButtonConfig,
  cancelButtonConfig,
  quizDifficultyFormFields,
} from '../../configs/quiz-difficulty-level.config';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { Subject, takeUntil } from 'rxjs';
import { QuizDifficultyLevelService } from '../../../../../services/admin/quiz-difficulty-level/quiz-difficulty-level.service';
import { platformMessages } from '../../../../../utils/constants';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { DifficultyLevelCredentials } from '../../interfaces/quiz-difficulty-level.interface';

type DifficultyFieldNames = (typeof quizDifficultyFormFields)[number]['name'];
type DifficultyFormErrors = Partial<Record<DifficultyFieldNames, string>>;

@Component({
  selector: 'app-add-difficulty-level',
  templateUrl: './add-difficulty-level.component.html',
  styleUrl: './add-difficulty-level.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FilledButtonComponent,
    OutlineButtonComponent,
  ],
})
export class AddDifficultyLevelComponent {
  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly difficultyService = inject(QuizDifficultyLevelService);
  private readonly snackbar = inject(SnackbarService);
  public readonly dialogRef = inject(MatDialogRef<AddDifficultyLevelComponent>);
  public readonly data = inject(MAT_DIALOG_DATA);

  difficultyForm: FormGroup;
  difficultyFields = quizDifficultyFormFields;
  cancelButton = cancelButtonConfig;
  addButton = addButtonConfig;
  serverErrors: DifficultyFormErrors = {};

  private readonly destroy$ = new Subject<void>();

  constructor() {
    const formControls = this.difficultyFields.reduce(
      (acc, field) => {
        acc[field.name] = ['', field.validators || []];
        return acc;
      },
      {} as Record<string, unknown>,
    );

    this.difficultyForm = this.fb.group(formControls);
  }

  // Returns the appropriate validation error message for a form field, prioritizing server errors.
  getError(fieldName: string): string | null {
    const control = this.difficultyForm.get(fieldName);
    const field = this.difficultyFields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages || {};

    if (control?.hasError('server')) {
      return this.serverErrors[fieldName] || platformMessages.errorMessage;
    }

    return this.validationErrorService.getErrorMessage(control!, messages, fieldName);
  }

  // Validates the "name" field against the backend and sets either a field error or a global snackbar error.
  validateName(): void {
    const control = this.difficultyForm.get('name');
    const value = control?.value?.trim();

    if (!value || control?.invalid) return;

    this.difficultyService
      .checkNameExists(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.serverErrors['name'] = '';
          if (control?.hasError('server')) {
            delete control.errors?.['server'];
            control.updateValueAndValidity({ onlySelf: true });
          }
        },
        error: (err) => {
          const status = err.status;
          const message = err?.error?.message || platformMessages.errorMessage;

          if (status >= 400 && status < 500) {
            this.serverErrors['name'] = message;
            control?.setErrors({ server: true });
          } else {
            this.snackbar.showError(`${platformMessages.errorTitle}`, message);
          }
        },
      });
  }

  // Handles form submission, calls backend to create a difficulty level, and closes dialog on success.
  onSubmit(): void {
    if (this.difficultyForm.invalid) {
      this.difficultyForm.markAllAsTouched();
      return;
    }

    const credentials: DifficultyLevelCredentials = {
      name: this.difficultyForm.value.name,
      description: this.difficultyForm.value.description,
    };

    this.difficultyService
      .createDifficultyLevel(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200) {
            this.snackbar.showError(
              `${platformMessages.errorTitle}`,
              res.message || platformMessages.errorMessage,
            );
            return;
          }

          this.dialogRef.close(res.message);
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  // Closes the dialog without saving changes.
  onCancel(): void {
    this.dialogRef.close(null);
  }

  // Cleans up active subscriptions when the component is destroyed.
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
