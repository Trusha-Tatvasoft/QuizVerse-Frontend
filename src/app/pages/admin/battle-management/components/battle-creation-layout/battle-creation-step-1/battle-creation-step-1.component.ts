import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  BattleStep1Data,
  QuestionDifficultyXP,
  BattleQuestionDifficulty,
} from '../../../interfaces/battle-creation.interface';
import { ValidationErrorService } from '../../../../../../shared/service/validation-error/validation-error.service';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import { battleCreationFormFields } from '../../../configs/battle-creation.config';
import { BattleManagementService } from '../../../../../../services/admin/battle-management/battle-management.service';
import { Subject, takeUntil, tap } from 'rxjs';
import { DropDownType } from '../../../../../../shared/enums/dropdown-types.enum';
import { DynamicFormField } from '../../../../../../shared/interfaces/dynamic-form-field.interface';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BattleTimeType } from '../../../../../../shared/enums/battle-management.enum';
import {
  afterCurrentStartDateValidator,
  afterStartDateValidator,
  noPastDateValidator,
} from '../../../../../../utils/no-past-date-validator.utils';
import { platformMessages } from '../../../../../../utils/constants';

@Component({
  selector: 'app-battle-creation-step-1',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    MatError,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './battle-creation-step-1.component.html',
  styleUrl: './battle-creation-step-1.component.scss',
})
export class BattleCreationStep1Component {
  // Input values (used for edit mode)
  @Input() initialFormValues: BattleStep1Data;
  @Input() isEditMode: boolean;

  // Outputs
  @Output() formValuesChange = new EventEmitter<BattleStep1Data>();
  @Output() categoryChanged = new EventEmitter();

  // Static form fields from config
  newBattleFields: DynamicFormField[] = battleCreationFormFields;
  newBattleForm: FormGroup;

  // Totals
  totalQuestionsStep1: number = 0;
  totalTimeStep1: number = 0; // in minutes
  totalXPStep1: number = 0;

  // Dropdown options
  battleDifficultyOption: { value: number; label: string }[] = [];
  battleTypeOption: { value: number; label: string }[] = [];
  questionsDifficultyXPOption: QuestionDifficultyXP[] = [];

  // Dynamic difficulty fields (questions + time)
  questionFields: DynamicFormField[] = [];

  // Enum accessible in template
  public BattleTimeType = BattleTimeType;

  // Injected services
  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly snackbar = inject(SnackbarService);
  private readonly battleManagementService = inject(BattleManagementService);

  // Internal mappings
  private difficultyXpMap: Record<string, number> = {};
  private difficultyIdMap: Record<string, number> = {};
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadSelectFieldOptions();
    this.initializeForm();
  }

  /**
   * Initialize form with difficulty fields, static fields and subscriptions
   */
  initializeForm(): void {
    this.getDifficultyQuestionFields().subscribe({
      next: () => {
        this.buildForm();
        this.restoreInitialValues();
        this.setupQuestionCountLogic();
        this.emitInitialFormState();
        this.setupBattleTypeChanges();
        this.setupFormValueChanges();
        this.categoryChange();
      },
      error: (err) => {
        this.snackbar.showError(
          platformMessages.errorTitle,
          err?.error?.message || platformMessages.errorMessage,
        );
      },
    });
  }

  /**
   * Returns error message for given field using ValidationErrorService
   */
  getError(fieldName: string): string | null {
    const control = this.newBattleForm.get(fieldName);
    const field = [...this.newBattleFields, ...this.questionFields].find(
      (f) => f.name === fieldName,
    );
    const customMessages = field?.validationMessages || {};
    return this.validationErrorService.getErrorMessage(control!, customMessages, fieldName);
  }

  /**
   * Validate and submit step1 form
   */
  submitStep1Form(): boolean {
    if (this.newBattleForm.invalid) {
      this.newBattleForm.markAllAsTouched();
      return false;
    }

    // Validate question count
    if (this.totalQuestionsStep1 < 5 || this.totalQuestionsStep1 > 100) {
      this.snackbar.showError(platformMessages.minimumNumberOfQuestionError);
      return false;
    }

    // Validate total time
    if (this.totalTimeStep1 > 180 || this.totalTimeStep1 < 2) {
      this.snackbar.showError(platformMessages.maximumTotalTimeError);
      return false;
    }

    // Validate XP
    if (this.totalXPStep1 <= 0) {
      this.snackbar.showError(platformMessages.minimumTotalXPError);
      return false;
    }

    // Build payload
    const payload: BattleStep1Data = this.setBattleStep1Data(this.newBattleForm);
    const val = this.newBattleForm.value;

    // Add start/end date only for TimeLimited type
    if (val.battleType === BattleTimeType.TimeLimited) {
      payload.startDate = val.startDate;
      payload.endDate = val.endDate;
    }

    this.formValuesChange.emit(payload);
    return true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load dropdown data for select fields
   */
  private loadSelectFieldOptions(): void {
    this.getDifficultyLevels();
    this.getQuizCategories();
    this.getBattleTypes();
  }

  /**
   * Emit categoryChanged when category value changes
   */
  private categoryChange(): void {
    this.newBattleForm.get('battleCategory')?.valueChanges.subscribe(() => {
      this.categoryChanged.emit();
    });
  }

  /**
   * Setup subscriptions to update totals on question/time field changes
   */
  private setupQuestionCountLogic(): void {
    this.questionFields.forEach((field) => {
      this.newBattleForm.get(field.name)?.valueChanges.subscribe(() => {
        this.updateTotals();
      });
    });
    this.updateTotals();
  }

  /**
   * Build BattleStep1Data from form values
   */
  private setBattleStep1Data(formGroup: FormGroup): BattleStep1Data {
    const val = formGroup.value;
    const battleCategoryId = val.battleCategory;
    const battleCategoryField = this.newBattleFields.find((f) => f.name === 'battleCategory');
    const battleCategoryName =
      battleCategoryField?.options?.find((opt) => opt.value === battleCategoryId)?.label || '';

    return {
      ...val,
      name: val.battleTitle,
      categoryId: val.battleCategory,
      difficultyLevelId: val.difficultyLevel,
      difficultyLevelName:
        this.battleDifficultyOption.find((opt) => opt.value === val.difficultyLevel)?.label || '',
      battleType: val.battleType,
      battleTypeName:
        this.battleTypeOption.find((opt) => opt.value === val.battleType)?.label || '',
      totalQuestion: this.totalQuestionsStep1,
      totalTime: this.totalTimeStep1,
      totalXp: this.totalXPStep1,
      battleCategoryName,
      questionsDifficulty: this.buildQuestionsDifficulty(),
    };
  }

  /**
   * Emit initial form state (for parent component)
   */
  private emitInitialFormState(): void {
    const val = this.newBattleForm.value;

    const formData: BattleStep1Data = this.setBattleStep1Data(this.newBattleForm);

    // Add dates only if TimeLimited
    if (val.battleType === BattleTimeType.TimeLimited) {
      formData.startDate = val.startDate;
      formData.endDate = val.endDate;
    }

    this.formValuesChange.emit(formData);
  }

  /**
   * Recalculate totals (questions, time, XP)
   */
  public updateTotals(): void {
    let totalQuestions = 0;
    let totalTime = 0;
    let totalXP = 0;

    this.questionFields.forEach((field) => {
      const control = this.newBattleForm.get(field.name);
      if (!control) return;

      const value = Number(control.value) || 0;
      const difficultyName: string = field.name.replace(/(Questions)/, '').toLowerCase();

      // Sum total questions
      if (field.name.toLowerCase().includes('questions')) {
        totalQuestions += value;
      }

      // Calculate XP
      if (this.difficultyXpMap[difficultyName]) {
        totalXP += value * this.difficultyXpMap[difficultyName];
      }

      // Calculate time (questions * time per question)
      if (field.name.toLowerCase().includes('time')) {
        const difficulty = field.name.replace('Time', 'Questions');
        const questionsControl = this.newBattleForm.get(difficulty);
        const numQuestions = Number(questionsControl?.value) || 0;
        totalTime += numQuestions * value;
      }
    });

    this.totalQuestionsStep1 = totalQuestions;
    const time = totalTime / 60; // convert seconds → minutes
    this.totalTimeStep1 = Number(time.toFixed(2));
    this.totalXPStep1 = totalXP;
  }

  /**
   * Build questionsDifficulty array for payload
   */
  private buildQuestionsDifficulty(): BattleQuestionDifficulty[] {
    const questionsDifficulty: BattleQuestionDifficulty[] = [];
    this.questionFields.forEach((field) => {
      if (!field.name.toLowerCase().includes('questions')) return;

      const difficultyName = field.name.replace('Questions', '').toLowerCase();
      const queDifficultyId = this.difficultyIdMap[difficultyName];
      if (!queDifficultyId) return;

      const noOfQues = Number(this.newBattleForm.get(field.name)?.value) || 0;
      const timeFieldName = `${difficultyName}Time`;
      const timePerQuestion = Number(this.newBattleForm.get(timeFieldName)?.value) || 0;

      if (noOfQues > 0 || timePerQuestion > 0) {
        questionsDifficulty.push({
          queDifficultyId,
          noOfQues,
          timePerQuestion,
        });
      }
    });
    return questionsDifficulty;
  }

  /**
   * Build reactive form with static + dynamic fields
   */
  private buildForm(): void {
    const allFields = [...this.newBattleFields, ...this.questionFields];

    this.newBattleForm = this.fb.group(
      allFields.reduce(
        (acc, field) => {
          let initialValue: unknown = '';

          // Prefill difficulty fields
          if (this.questionFields.some((qf) => qf.name === field.name)) {
            const difficultyName = field.name.replace(/(Questions|Time)$/, '').toLowerCase();
            const queDifficultyId = this.difficultyIdMap[difficultyName];
            if (queDifficultyId === undefined) {
              initialValue = field.name.includes('Questions') ? 0 : 30;
            } else {
              const prefilled = this.initialFormValues?.questionsDifficulty?.find(
                (qd) => qd.queDifficultyId === queDifficultyId,
              );
              initialValue = field.name.includes('Questions')
                ? (prefilled?.noOfQues ?? 0)
                : (prefilled?.timePerQuestion ?? 30);
            }
          } else {
            // Map static fields
            const fieldNameMap: { [key: string]: keyof BattleStep1Data } = {
              battleTitle: 'name',
              battleCategory: 'categoryId',
              difficultyLevel: 'difficultyLevelId',
            };
            const mappedFieldName = fieldNameMap[field.name] || field.name;
            initialValue = this.initialFormValues?.[mappedFieldName as keyof BattleStep1Data] ?? '';
          }

          // Add validators
          const validators = Array.isArray(field.validators)
            ? field.validators.filter((v) => typeof v === 'function')
            : [];

          acc[field.name] = [initialValue, validators];
          return acc;
        },
        {} as Record<string, unknown>,
      ),
    );
  }

  /**
   * Restore values from @Input initialFormValues
   */
  private restoreInitialValues(): void {
    if (!this.initialFormValues) return;

    this.newBattleForm.patchValue(this.initialFormValues, { emitEvent: false });
    // Apply validators for battleType if needed
    const battleType = this.newBattleForm.get('battleType')?.value;
    if (battleType !== undefined) {
      this.applyBattleTypeValidators(battleType);
    }
  }

  /**
   * Apply validators for TimeLimited battles
   */
  private applyBattleTypeValidators(battleType: BattleTimeType) {
    const startDateControl = this.newBattleForm.get('startDate');
    const endDateControl = this.newBattleForm.get('endDate');

    if (battleType === BattleTimeType.TimeLimited) {
      startDateControl?.setValidators([
        Validators.required,
        this.isEditMode && this.initialFormValues?.startDate
          ? afterCurrentStartDateValidator(this.initialFormValues.startDate)
          : noPastDateValidator,
      ]);
      endDateControl?.setValidators([
        Validators.required,
        noPastDateValidator,
        afterStartDateValidator('startDate'),
      ]);
      const startDateField = this.newBattleFields.find((f) => f.name === 'startDate');
      if (startDateField) {
        startDateField.validationMessages = {
          ...startDateField.validationMessages,
          afterCurrentStartDate: 'Start Date must be same or after the current Start Date.',
        };
      }
    } else {
      startDateControl?.clearValidators();
      endDateControl?.clearValidators();
      startDateControl?.setValue(null);
      endDateControl?.setValue(null);
    }

    startDateControl?.updateValueAndValidity();
    endDateControl?.updateValueAndValidity();
  }

  /**
   * Listen to form changes and emit updated form values
   */
  private setupFormValueChanges(): void {
    this.newBattleForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      const categoryId = val.battleCategory;
      const categoryField = this.newBattleFields.find((f) => f.name === 'battleCategory');
      const categoryName =
        categoryField?.options?.find((opt) => opt.value === categoryId)?.label || '';

      this.formValuesChange.emit({
        ...val,
        name: val.battleTitle,
        categoryId: val.battleCategory,
        difficultyLevelId: val.difficultyLevel,
        difficultyLevelName:
          this.battleDifficultyOption.find((opt) => opt.value === val.difficultyLevel)?.label || '',
        battleType: val.battleType,
        battleTypeName:
          this.battleTypeOption.find((opt) => opt.value === val.battleType)?.label || '',
        totalQuestion: this.totalQuestionsStep1,
        totalTime: this.totalTimeStep1,
        totalXp: this.totalXPStep1,
        battleCategoryName: categoryName,
        questionsDifficulty: this.buildQuestionsDifficulty(),
      });
    });
  }

  /**
   * Fetch difficulty levels dropdown
   */
  private getDifficultyLevels(): void {
    this.battleManagementService
      .getDropDownData(DropDownType.QuizDifficulty)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.data)) {
            const difficultyOptions = response.data.map((item) => ({
              value: item.id,
              label: item.name,
            }));
            this.battleDifficultyOption = difficultyOptions;
            const difficultyField = this.newBattleFields.find(
              (field) => field.name === 'difficultyLevel',
            );
            if (difficultyField) {
              difficultyField.options = difficultyOptions;
            }
          }
        },
        error: (error) => {
          this.snackbar.showError(error);
        },
      });
  }

  /**
   * Fetch quiz categories dropdown
   */
  private getQuizCategories(): void {
    this.battleManagementService
      .getDropDownData(DropDownType.QuizCategory)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.data)) {
            const categoryOptions = response.data.map((item) => ({
              value: item.id,
              label: item.name,
            }));

            const categoryField = this.newBattleFields.find(
              (field) => field.name === 'battleCategory',
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

  /**
   * Build battle type dropdown options
   */
  private getBattleTypes(): void {
    const battleTypes = Object.keys(BattleTimeType).filter((key) => isNaN(Number(key))) as Array<
      keyof typeof BattleTimeType
    >;

    const typeOptions = battleTypes.map((key) => ({
      value: BattleTimeType[key],
      label: key
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^./, (str) => str.toUpperCase()),
    }));

    this.battleTypeOption = typeOptions;

    const typeField = this.newBattleFields.find((field) => field.name === 'battleType');

    if (typeField) {
      typeField.options = typeOptions;
    } else {
      this.snackbar.showError('BattleType field not found in newBattleFields');
    }
  }

  /**
   * Listen for battleType changes → update validators + emit form state
   */
  private setupBattleTypeChanges(): void {
    this.newBattleForm
      .get('battleType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((battleType) => {
        this.applyBattleTypeValidators(battleType);
        this.emitInitialFormState();
      });
  }
  /**
   * Fetches the question difficulty XP configuration from the service
   * and dynamically builds form fields for each difficulty level.
   */
  private getDifficultyQuestionFields() {
    return this.battleManagementService.getQuestionDifficultyXP().pipe(
      takeUntil(this.destroy$),
      tap({
        next: (response) => {
          if (!Array.isArray(response.data)) return;
          this.questionsDifficultyXPOption = response.data;

          // reset before assigning
          this.difficultyXpMap = {};
          this.difficultyIdMap = {};

          this.questionFields = response.data.flatMap((item: QuestionDifficultyXP) => {
            const lower = item.questionDifficultyName.toLowerCase();

            // save xp and id mapping
            this.difficultyXpMap[lower] = item.xpGained;
            this.difficultyIdMap[lower] = item.questionDifficultyId;

            const qField: DynamicFormField = {
              name: `${lower}Questions`,
              label: `${item.questionDifficultyName} Questions (${item.xpGained} XP each)`,
              type: 'number',
              placeholder: `No of ${lower} questions`,
              validators: [Validators.required, Validators.min(0), Validators.max(100)],
              validationMessages: {
                required: `${item.questionDifficultyName} Questions is required.`,
                min: `No of ${item.questionDifficultyName} Questions cannot be less than 0.`,
                max: `No of ${item.questionDifficultyName} Questions cannot be more than 100.`,
              },
            };

            const tField: DynamicFormField = {
              name: `${lower}Time`,
              label: `Time per ${item.questionDifficultyName} Question (seconds)`,
              type: 'number',
              placeholder: `Time per ${lower} question (sec)`,
              validators: [Validators.required, Validators.min(1), Validators.max(600)],
              validationMessages: {
                required: `Time per ${item.questionDifficultyName} Question is required.`,
                min: `Time must be at least 1 second.`,
                max: `Time cannot exceed 600 seconds.`,
              },
            };

            return [qField, tField];
          });
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      }),
    );
  }
}
