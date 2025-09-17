import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { QuestionDifficultyService } from '../../../../../services/admin/question-difficulty/question-difficulty.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  addButtonConfig,
  cancelButtonConfig,
  editButtonConfig,
  questionDifficultyFormFields,
} from '../../configs/question-difficulty.config';
import { Subject, takeUntil } from 'rxjs';
import { platformMessages } from '../../../../../utils/constants';
import {
  QuestionDifficultyRequestDTO,
  QuestionDifficultyResponseDTO,
} from '../../interfaces/question-difficulty.interface';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

type DifficultyFieldNames = (typeof questionDifficultyFormFields)[number]['name'];
type DifficultyFormErrors = Partial<Record<DifficultyFieldNames, string>>;

@Component({
  selector: 'app-add-edit-question-difficulty',
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
  templateUrl: './add-edit-question-difficulty.component.html',
  styleUrl: './add-edit-question-difficulty.component.scss',
})
export class AddEditQuestionDifficultyComponent {
  // Configs
  cancelButton = cancelButtonConfig;
  addButton = addButtonConfig;
  editButton = editButtonConfig;
  difficultyFields = questionDifficultyFormFields;

  questionDifficultyForm: FormGroup;

  // Dependencies
  readonly data = inject(MAT_DIALOG_DATA) as QuestionDifficultyResponseDTO | null;
  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly questionDifficultyService = inject(QuestionDifficultyService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialogRef = inject(MatDialogRef<AddEditQuestionDifficultyComponent>);

  private readonly destroy$ = new Subject<void>();
  private serverErrors: DifficultyFormErrors = {};

  ngOnInit(): void {
    this.initializeForm();

    if (this.data) {
      this.prefillForm(this.data);
    }
  }

  // Returns the appropriate validation error message for a form field, prioritizing server errors.
  getError(fieldName: string): string | null {
    const control = this.questionDifficultyForm.get(fieldName);
    const field = this.difficultyFields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages || {};

    if (control?.hasError('server')) {
      return this.serverErrors[fieldName] || platformMessages.errorMessage;
    }

    return this.validationErrorService.getErrorMessage(control!, messages, fieldName);
  }

  // Validates the "name" field against the backend and sets either a field error or a global snackbar error.
  validateName(): void {
    const control = this.questionDifficultyForm.get('name');
    const value = control?.value?.trim();

    if (!value || control?.invalid) return;

    if (this.data && value.toLowerCase() === this.data.name.toLowerCase()) {
      this.serverErrors['name'] = '';
      if (control?.hasError('server')) {
        delete control.errors?.['server'];
        control.updateValueAndValidity({ onlySelf: true });
      }
      return;
    }

    this.questionDifficultyService
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

  // Validates the "xp" field against the backend and sets either a field error or a global snackbar error.
  validateXP(): void {
    const control = this.questionDifficultyForm.get('xpPerQuestion');
    const value: number = Number(control?.value);

    if (!value || control?.invalid) return;

    if (this.data && value === this.data.xpGained) {
      this.serverErrors['xpPerQuestion'] = '';
      if (control?.hasError('server')) {
        delete control.errors?.['server'];
        control.updateValueAndValidity({ onlySelf: true });
      }
      return;
    }

    this.questionDifficultyService
      .checkXPExists(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.serverErrors['xpPerQuestion'] = '';
          if (control?.hasError('server')) {
            delete control.errors?.['server'];
            control.updateValueAndValidity({ onlySelf: true });
          }
        },
        error: (err) => {
          const status = err.status;
          const message = err?.error?.message || platformMessages.errorMessage;

          if (status >= 400 && status < 500) {
            this.serverErrors['xpPerQuestion'] = message;
            control?.setErrors({ server: true });
          } else {
            this.snackbar.showError(`${platformMessages.errorTitle}`, message);
          }
        },
      });
  }

  // Handles form submission, calls backend to create a difficulty level, and closes dialog on success.
  formSubmit(): void {
    if (this.questionDifficultyForm.invalid) {
      this.questionDifficultyForm.markAllAsTouched();
      return;
    }

    const credentials: QuestionDifficultyRequestDTO = {
      id: this.data?.id ?? 0,
      name: this.questionDifficultyForm.value.name,
      description: this.questionDifficultyForm.value.description,
      xpGainedPerQuestion: this.questionDifficultyForm.value.xpPerQuestion,
    };

    this.questionDifficultyService
      .createQuestionDifficultyLevel(credentials)
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
  cancelButtonClicked(): void {
    this.dialogRef.close(null);
  }

  // Cleans up active subscriptions when the component is destroyed.
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Prefills the form with existing difficulty details when editing.
  private prefillForm(details: QuestionDifficultyResponseDTO): void {
    this.questionDifficultyForm.patchValue({
      name: details.name,
      description: details.description,
      xpPerQuestion: details.xpGained,
    });
  }

  // Initializes the reactive form with controls and validators.
  private initializeForm(): void {
    const formControls = this.difficultyFields.reduce(
      (acc, field) => {
        acc[field.name] = ['', field.validators || []];
        return acc;
      },
      {} as Record<string, unknown>,
    );

    this.questionDifficultyForm = this.fb.group(formControls);
  }
}
