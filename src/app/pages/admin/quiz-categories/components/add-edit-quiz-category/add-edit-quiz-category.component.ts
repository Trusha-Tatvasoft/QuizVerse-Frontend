import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { MatSelectModule } from '@angular/material/select';
import { cancelButtonConfig } from '../../../user-management/configs/user-confirmation-dialog.config';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  activeTagConfig,
  createCategoryButtonConfig,
  quizCategoryFormFeild,
} from '../../configs/quiz-category-management.config';
import {
  QuizCategoryList,
  SaveQuizCategory,
} from '../../interface/quiz-category-list-data.interface';
import { QuizCategoryManagementService } from '../../../../../services/admin/quiz-category-management/quiz-category-management.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { defaultIcon, platformMessages, updateCategory } from '../../../../../utils/constants';

type CategoryFieldNames = (typeof quizCategoryFormFeild)[number]['name'];
type CategoryFormErrors = Partial<Record<CategoryFieldNames, string>>;

@Component({
  selector: 'app-add-edit-quiz-category',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    FilledButtonComponent,
    OutlineButtonComponent,
    CdkTextareaAutosize,
  ],
  templateUrl: './add-edit-quiz-category.component.html',
  styleUrls: ['./add-edit-quiz-category.component.scss'],
})
export class AddEditQuizCategoryComponent implements OnInit, OnDestroy {
  @Input() data: QuizCategoryList | null = null;
  @Output() close = new EventEmitter<{ refresh?: boolean }>();

  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly quizCategoryManagementService = inject(QuizCategoryManagementService);
  private readonly snackbar = inject(SnackbarService);

  categoryForm: FormGroup;
  categoryFields = quizCategoryFormFeild;
  cancelButton = cancelButtonConfig;
  addButton = { ...createCategoryButtonConfig };
  serverErrors: CategoryFormErrors = {};
  tagConfig = activeTagConfig;

  private readonly destroy$ = new Subject<void>();

  constructor() {
    const formControls = Object.fromEntries(
      this.categoryFields.map((field) => [field.name, ['', field.validators ?? []]]),
    );
    this.categoryForm = this.fb.group(formControls);
  }

  ngOnInit(): void {
    if (this.data) {
      this.categoryForm.patchValue({
        name: this.data.categoryName,
        description: this.data.description,
        icon: this.data.icon || defaultIcon,
      });

      const iconField = quizCategoryFormFeild.find((f) => f.name === 'icon');
      if (iconField) {
        iconField.icon = this.data.icon || defaultIcon;
      }
      this.addButton.label = updateCategory;
    }

    this.categoryForm.get('icon')?.valueChanges.subscribe((selectedIcon) => {
      const iconField = quizCategoryFormFeild.find((f) => f.name === 'icon');
      if (iconField) {
        iconField.icon = selectedIcon || defaultIcon;
      }
    });
  }

  validateName(): void {
    const control = this.categoryForm.get('name');
    const value = control?.value?.trim();
    if (!value || control?.invalid) return;

    this.quizCategoryManagementService
      .checkQuizCategoryNameAvailable(value, this.data?.id) // Pass id if editing
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.serverErrors['name'] = '';
          if (control?.hasError('server')) {
            control.errors?.['server'];
            control.updateValueAndValidity({ onlySelf: true });
          }
        },
        error: (err) => {
          const message = err?.error?.message || platformMessages.errorMessage;
          this.serverErrors['name'] = message;
          control?.setErrors({ server: true });
        },
      });
  }

  getError(fieldName: string): string | null {
    const control = this.categoryForm.get(fieldName);
    const field = this.categoryFields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages || {};

    if (control?.hasError('server')) {
      return this.serverErrors[fieldName] || platformMessages.errorMessage;
    }

    return this.validationErrorService.getErrorMessage(control!, messages, fieldName);
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const credentials: SaveQuizCategory = {
      id: this.data?.id,
      categoryName: this.categoryForm.value.name.trim(),
      description: this.categoryForm.value.description.trim(),
      icon: this.categoryForm.value.icon?.trim() || defaultIcon,
    };

    this.quizCategoryManagementService
      .createOrUpdateQuizCategory(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || (res.statusCode !== 200 && res.statusCode !== 201)) {
            this.snackbar.showError(
              platformMessages.errorTitle,
              res.message || platformMessages.errorMessage,
            );
            return;
          }

          this.snackbar.showSuccess(platformMessages.successTitle, res.message);
          this.close.emit({ refresh: true });
        },
        error: (err) => {
          const message = err?.error?.message || platformMessages.errorMessage;
          this.snackbar.showError(platformMessages.errorTitle, message);
        },
      });
  }

  resetCategoryForm(): void {
    this.categoryForm.reset({
      name: '',
      description: '',
      icon: defaultIcon,
    });

    const iconField = quizCategoryFormFeild.find((f) => f.name === 'icon');
    if (iconField) {
      iconField.icon = defaultIcon;
    }
  }

  onCancel(): void {
    this.close.emit({ refresh: false });
    this.resetCategoryForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
