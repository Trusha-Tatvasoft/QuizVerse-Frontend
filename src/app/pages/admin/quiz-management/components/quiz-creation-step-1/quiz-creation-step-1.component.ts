import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { addTagButtonConfig, quizCreationFormFields } from '../../configs/quiz-creation.config';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { MatError, MatInputModule } from '@angular/material/input';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { MatCheckbox } from '@angular/material/checkbox';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { QuizStep1Data } from '../../../../../shared/interfaces/quiz-creation.interface';
import { platformMessages, quizCRUDMessages } from '../../../../../utils/constants';
import { Subject, takeUntil } from 'rxjs';
import { DropDownType } from '../../../../../shared/enums/dropdown-types.enum';

@Component({
  selector: 'app-quiz-creation-step-1',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatError,
    TagComponent,
    OutlineButtonComponent,
    MatIcon,
    MatInputModule,
    MatOptionModule,
    MatCheckbox,
    MatSlideToggleModule,
    FormsModule,
  ],
  templateUrl: './quiz-creation-step-1.component.html',
  styleUrl: './quiz-creation-step-1.component.scss',
})
export class QuizCreationStep1Component {
  //old data
  @Input() initialFormValues: QuizStep1Data;
  @Input() isEditMode: boolean;
  @Output() formValuesChange = new EventEmitter<QuizStep1Data>();
  @Output() categoryChanged = new EventEmitter();

  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly snackbar = inject(SnackbarService);
  private readonly quizCreationService = inject(QuizCreationService);

  // Button and form field configurations
  addTagButton = addTagButtonConfig;
  newQuizFields = quizCreationFormFields;
  tagList: TagInputConfig[] = [];

  private readonly destroy$ = new Subject<void>();
  filteredNewQuizFields = this.newQuizFields.slice(0, -4);
  questionFields = this.newQuizFields.slice(-3);
  newQuizForm: FormGroup;
  totalQuestionsStep1: number;
  tagInput: string = '';

  //data from db
  allTags: string[] = [];

  ngOnInit(): void {
    this.initializeForm();
    this.loadSelectFieldOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    // First fetch dynamic difficulty fields, then build the form
    this.getDifficultyQuestionFields().add(() => {
      this.buildForm();
      this.restoreInitialValues();
      this.setupPriceToggleLogic();
      this.setupQuestionCountLogic();
      this.emitInitialFormState();
      this.setupFormValueChanges();
      this.categoryChange();
    });
  }

  private buildForm(): void {
    this.newQuizForm = this.fb.group(
      this.newQuizFields.reduce(
        (acc, field) => {
          const isQuestionField = this.questionFields.some((qf) => qf.name === field.name);

          let initialValue: number | string = '';
          if (isQuestionField) {
            // Get prefilled value from initialFormValues
            const prefilled = this.initialFormValues?.difficultyDistribution?.find(
              (d) => d.key === field.name,
            );
            initialValue = prefilled?.value ?? 0; // fallback to 0 if not found
          }

          acc[field.name] = [initialValue, field.validators];
          return acc;
        },
        {} as Record<string, unknown>,
      ),
    );
  }

  private restoreInitialValues(): void {
    if (!this.initialFormValues) return;

    this.newQuizForm.patchValue(this.initialFormValues);

    if (this.initialFormValues.tags) {
      this.tagList = this.initialFormValues.tags.map((label: string) => this.createTag(label));
    }
  }

  private setupPriceToggleLogic(): void {
    this.newQuizForm.get('isPaid')?.valueChanges.subscribe((isPaid: boolean) => {
      this.togglePriceValidation(isPaid);
    });
    this.togglePriceValidation(this.newQuizForm.get('isPaid')?.value);
  }

  private categoryChange(): void {
    this.newQuizForm.get('quizCategory')?.valueChanges.subscribe(() => {
      this.categoryChanged.emit();
    });
  }

  private setupQuestionCountLogic(): void {
    this.questionFields.forEach((field) => {
      this.newQuizForm.get(field.name)?.valueChanges.subscribe(() => {
        this.updateTotalQuestions();
      });
    });
    this.updateTotalQuestions();
  }

  private emitInitialFormState(): void {
    this.formValuesChange.emit(this.newQuizForm.value);
  }

  private setupFormValueChanges(): void {
    this.newQuizForm.valueChanges.subscribe((val) => {
      const quizCategoryId = val.quizCategory;
      const quizCategoryField = this.filteredNewQuizFields.find((f) => f.name === 'quizCategory');
      const quizCategoryName =
        quizCategoryField?.options?.find((opt) => opt.value === quizCategoryId)?.label || '';

      this.formValuesChange.emit({
        ...val,
        tags: this.tagList.map((t) => t.label),
        quizCategoryName,
        totalQuestions: this.totalQuestionsStep1,
      });
    });
  }

  private loadSelectFieldOptions(): void {
    this.getDifficultyLevels();
    this.getQuizCategories();
    this.getTags();
  }

  private togglePriceValidation(isPaid: boolean): void {
    const priceField = this.getFieldByName('price');
    if (!priceField) return;

    if (isPaid) {
      // Add control if not exists
      this.toggleFormField('price', true, '', priceField.validators as ValidatorFn[]);

      // Now get control and set validators including required
      const priceControl = this.newQuizForm.get('price');
      if (priceControl) {
        priceControl.setValidators([
          Validators.required,
          ...((priceField.validators ?? []) as ValidatorFn[]),
        ]);
        priceControl.updateValueAndValidity();
      }
    } else {
      // Remove control
      this.toggleFormField('price', false);
    }
  }

  private createTag(label: string): TagInputConfig {
    return {
      id: Date.now().toString(),
      label,
      type: 'selectable',
      isSelected: true,
      hasBorder: true,
      backgroundColor: 'blue',
      textColor: 'white',
    };
  }

  private toggleFormField(
    fieldName: string,
    add: boolean,
    initialValue: string = '',
    validators: ValidatorFn[] = [],
  ): void {
    if (add) {
      this.newQuizForm.addControl(fieldName, new FormControl<string>(initialValue, validators));
    } else {
      if (this.newQuizForm.contains(fieldName)) {
        this.newQuizForm.removeControl(fieldName);
      }
    }
  }

  private updateTotalQuestions(): void {
    this.totalQuestionsStep1 = this.questionFields.reduce((sum, field) => {
      const value = Number(this.newQuizForm.get(field.name)?.value) || 0;
      return sum + value;
    }, 0);
  }

  getFieldByName(name: string) {
    return this.newQuizFields.find((field) => field.name === name);
  }

  getError(fieldName: string): string | null {
    const control = this.newQuizForm.get(fieldName);
    const field = this.newQuizFields.find((f) => f.name === fieldName);
    const customMessages = field?.validationMessages || {};

    return this.validationErrorService.getErrorMessage(control!, customMessages, fieldName);
  }

  addTag(): void {
    const trimmed = this.tagInput.trim();
    if (trimmed && !this.tagList.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())) {
      this.tagList.push(this.createTag(trimmed));
    }
    this.tagInput = '';
  }

  removeTag(tag: TagInputConfig): void {
    this.tagList = this.tagList.filter((t) => t.id !== tag.id);
  }

  filteredTags(): string[] {
    const input = this.tagInput.toLowerCase();
    return this.allTags
      .filter((tag) => !this.tagList.some((t) => t.label.toLowerCase() === tag.toLowerCase()))
      .filter((tag) => tag.toLowerCase().includes(input));
  }

  submitStep1Form(): boolean {
    if (this.newQuizForm.invalid) {
      this.newQuizForm.markAllAsTouched();
      return false;
    }

    if (this.totalQuestionsStep1 < 5 || this.totalQuestionsStep1 > 100) {
      this.snackbar.showError(quizCRUDMessages.minimumNumberOfQuestionError);
      return false;
    }

    const val = this.newQuizForm.value;
    if (val.quizTiming > 180 || val.quizTiming < 2) {
      this.snackbar.showError(quizCRUDMessages.maximumTotalTimeError);
      return false;
    }
    const quizCategoryId = val.quizCategory;
    const quizCategoryField = this.filteredNewQuizFields.find((f) => f.name === 'quizCategory');
    const quizCategoryName =
      quizCategoryField?.options?.find((opt) => opt.value === quizCategoryId)?.label || '';

    const payload = {
      ...val,
      tags: this.tagList.map((t) => t.label),
      quizCategoryName,
      totalQuestions: this.totalQuestionsStep1,
    };

    this.formValuesChange.emit(payload);
    return true;
  }

  //Data from db
  getDifficultyLevels() {
    this.quizCreationService
      .getDropDownData(DropDownType.QuizDifficulty)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.data)) {
            const difficultyOptions = response.data.map((item) => ({
              value: item.id,
              label: item.name,
            }));
            const difficultyField = this.filteredNewQuizFields.find(
              (field) => field.name === 'difficultyLevel',
            );
            if (difficultyField) {
              difficultyField.options = difficultyOptions;
            }
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  // Data from DB for Quiz Categories
  getQuizCategories() {
    this.quizCreationService
      .getDropDownData(DropDownType.QuizCategory)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.data)) {
            const categoryOptions = response.data.map((item) => ({
              value: item.id,
              label: item.name,
            }));

            const categoryField = this.filteredNewQuizFields.find(
              (field) => field.name === 'quizCategory',
            );

            if (categoryField) {
              categoryField.options = categoryOptions;
            }
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  // Question difficulty fields
  getDifficultyQuestionFields() {
    return this.quizCreationService
      .getDropDownData(DropDownType.QuestionDifficulty)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.data)) {
            this.questionFields = [];
            this.newQuizFields = this.newQuizFields.filter(
              (field) =>
                !['easyQuestions', 'mediumQuestions', 'hardQuestions'].includes(field.name),
            );

            const dynamicDifficultyFields = response.data.map((item) => ({
              name: `${item.name.toLowerCase()}Questions`,
              label: `${item.name} Questions`,
              type: 'number',
              placeholder: `No of ${item.name.toLowerCase()} questions`,
              validators: [Validators.required, Validators.maxLength(255), Validators.min(0)],
              validationMessages: {
                required: `No of ${item.name} Questions is required.`,
                min: `No of ${item.name} Questions cannot be less than 0.`,
                max: `No of ${item.name} Questions cannot be more than 255.`,
              },

              gridClass: 'col-span-3 sm:col-span-1',
            }));

            this.questionFields.push(...dynamicDifficultyFields);
            this.newQuizFields.push(...dynamicDifficultyFields);
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  getTags(): void {
    this.quizCreationService
      .getDropDownData(DropDownType.QuizTag)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.data)) {
            this.allTags = response.data.map((item) => item.name);
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }
}
