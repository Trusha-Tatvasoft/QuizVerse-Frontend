import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { cancelButtonConfig, submitButtonConfig } from '../../../../configs/question-pool.config';
import { DynamicFormField } from '../../../../../../../shared/interfaces/dynamic-form-field.interface';
import { QuestionDetail } from '../../../../interfaces/question-pool-preview.interface';
import { CommonListDropDown } from '../../../../../../../shared/interfaces/common-dropdown.interface';
import { DropDownType } from '../../../../../../../shared/enums/dropdown-types.enum';
import { FilledButtonComponent } from '../../../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../../../shared/components/outline-button/outline-button.component';
import { QuestionFormDialogComponent } from '../../../question-form-dialog/question-form-dialog.component';
import { DropdownService } from '../../../../../../../shared/service/dropdown/dropdown.service';
import { QuestionPoolService } from '../../../../../../../services/admin/question-pool/question-pool.service';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import {
  buildBaseFields,
  buildFieldsByQuestionType,
} from '../../../../configs/question-pool-dialog.config';
import {
  mapFormToQuestionRequest,
  patchFormWithQuestion,
  updateDropdownOptions,
} from './create-edit-question-form.hepler';
import { uniqueOptionsGroupValidator } from './create-edit-question-form.validator';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';
import { platformMessages } from '../../../../../../../utils/constants';

@Component({
  selector: 'app-create-edit-question-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FilledButtonComponent,
    OutlineButtonComponent,
  ],
  templateUrl: './create-edit-question-form.component.html',
  styleUrls: ['./create-edit-question-form.component.scss'],
})
export class CreateEditQuestionFormComponent implements OnInit, OnDestroy {
  @Input() questionData?: QuestionDetail;

  private readonly dialogRef = inject(MatDialogRef<QuestionFormDialogComponent>);
  private readonly dropdownService = inject(DropdownService);
  private readonly questionService = inject(QuestionPoolService);
  private readonly snackbar = inject(SnackbarService);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly fb = inject(FormBuilder);

  private readonly destroy$ = new Subject<void>();

  submitBtn = submitButtonConfig;
  cancelBtn = cancelButtonConfig;

  form!: FormGroup;

  fields: DynamicFormField[] = [];
  baseFields: DynamicFormField[] = [];
  categoryList: CommonListDropDown[] = [];
  difficultyList: CommonListDropDown[] = [];
  typeList: CommonListDropDown[] = [];

  ngOnInit() {
    this.baseFields = buildBaseFields();
    this.fields = [...this.baseFields];
    this.buildForm();
    this.form.get('type')?.valueChanges.subscribe((type) => this.updateFieldsByType(type));

    this.loadDropdowns();
  }

  patchFormWithQuestionData(data: QuestionDetail) {
    patchFormWithQuestion(this.form, data, this.categoryList, this.difficultyList, this.typeList);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDropdowns() {
    forkJoin({
      categories: this.dropdownService.getDropdownData(DropDownType.QuizCategory),
      difficulties: this.dropdownService.getDropdownData(DropDownType.QuestionDifficulty),
      types: this.dropdownService.getDropdownData(DropDownType.QuestionType),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ categories, difficulties, types }) => {
        this.categoryList = categories;
        this.difficultyList = difficulties;
        this.typeList = types;

        updateDropdownOptions(this.fields, this.categoryList, this.difficultyList, this.typeList);

        if (this.questionData) {
          this.patchFormWithQuestionData(this.questionData);
        }
      });
  }

  buildForm() {
    this.form = this.fb.group({});
    this.fields.forEach((field) => {
      this.form.addControl(
        field.name,
        this.fb.control('', (field.validators as ValidatorFn[]) || []),
      );
    });
  }

  // updating the option fields by the question type
  updateFieldsByType(type: number) {
    Object.keys(this.form.controls).forEach((control) => {
      if (!this.baseFields.find((f) => f.name === control)) {
        this.form.removeControl(control);
      }
    });

    const extraFields = buildFieldsByQuestionType(type);
    this.fields = [...this.baseFields, ...extraFields];

    for (const field of extraFields) {
      this.form.addControl(
        field.name,
        this.fb.control('', { validators: (field.validators as ValidatorFn[]) ?? [] }),
      );
    }

    // attaching validator to mcq options
    if (type === 1) {
      const optionKeys = extraFields.filter((f) => f.name.startsWith('option')).map((f) => f.name);

      this.form.setValidators(uniqueOptionsGroupValidator(optionKeys));
    } else {
      this.form.clearValidators();
    }

    this.form.updateValueAndValidity({ emitEvent: false });
  }

  getError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control) return null;

    const field = this.fields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages ?? {};

    return this.validationErrorService.getErrorMessage(control, messages, fieldName);
  }

  createOrUpdateQuestion() {
    if (this.form.valid) {
      const dto = mapFormToQuestionRequest(this.form);

      this.questionService
        .createOrUpdateQuestion(this.questionData?.id ?? 0, dto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.result) {
              this.snackbar.showSuccess(platformMessages.successTitle, res.message);
              this.dialogRef.close(true);
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
    } else {
      this.form.markAllAsTouched();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
