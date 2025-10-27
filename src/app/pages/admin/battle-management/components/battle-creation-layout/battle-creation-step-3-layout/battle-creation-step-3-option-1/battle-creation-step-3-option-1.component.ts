import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { OutlineButtonComponent } from '../../../../../../../shared/components/outline-button/outline-button.component';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FilledButtonComponent } from '../../../../../../../shared/components/filled-button/filled-button.component';
import { BattleStep1Data, QuestionsList } from '../../../../interfaces/battle-creation.interface';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import {
  changeQuestionMethodButtonConfig,
  changeQuestionMethodSmallButtonConfig,
  questionFormFieldForAddQuestionManually,
} from '../../../../../quiz-management/configs/quiz-creation.config';
import {
  addQuestionButtonConfig,
  searchInputConfig,
} from '../../../../../question-pool/configs/question-pool.config';
import { Subject, takeUntil } from 'rxjs';
import { DynamicFormField } from '../../../../../../../shared/interfaces/dynamic-form-field.interface';
import { QuestionType } from '../../../../../../../shared/enums/quiz-management.enum';
import { questionTypes, quizCRUDMessages } from '../../../../../../../utils/constants';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-battle-creation-step-3-option-1',
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    CommonModule,
    OutlineButtonComponent,
    MatIcon,
    MatInputModule,
    FilledButtonComponent,
  ],
  templateUrl: './battle-creation-step-3-option-1.component.html',
  styleUrl: './battle-creation-step-3-option-1.component.scss',
})
export class BattleCreationStep3Option1Component {
  // ---- Inputs from parent ----
  @Input() selectedQuestions: QuestionsList[] = [];
  @Input() battleStep1Data: BattleStep1Data;
  @Input() questionDifficultyOption: { value: number; label: string }[] = [];
  @Input() questionTypeOptions: { value: number; label: string }[] = [];

  // ---- Outputs to parent ----
  @Output() closeQuestionAdditionOption = new EventEmitter(); // Output: notify parent to close this option UI
  @Output() selectedQuestionsChangeFromInnerStep3Option1 = new EventEmitter<QuestionsList[]>(); // Output: notify parent when questions are updated

  // ---- UI Configurations ----
  changeMethodButton = changeQuestionMethodButtonConfig;
  changeMethodSmallButton = changeQuestionMethodSmallButtonConfig;
  searchInputConfig = searchInputConfig;
  questionFormFieldForAddQuestionManuallyStep3 = questionFormFieldForAddQuestionManually;
  addQuestionButton = addQuestionButtonConfig;

  // ---- Form ----
  questionForm: FormGroup;
  isSmallScreen = false;

  // ---- Services ----
  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly snackbar = inject(SnackbarService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.buildQuestionForm();
    this.getDropDownsData();

    this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isSmallScreen = result.matches;
      });
  }

  // Close option panel (emit to parent)
  closeOption() {
    this.closeQuestionAdditionOption.emit();
  }

  // Check if selected type is True/False
  isTrueFalseType(): boolean {
    const selectedTypeId = this.questionForm.get('type')?.value;
    const typeOption = this.questionTypeOptions.find((opt) => opt.value === selectedTypeId);
    return typeOption?.label.toLowerCase() === questionTypes.TRUE_FALSE.toLowerCase();
  }

  // Check if selected type is Fill In the Blanks
  isFillInTheBlanksType(): boolean {
    const selectedTypeId = this.questionForm.get('type')?.value;
    const typeOption = this.questionTypeOptions.find((opt) => opt.value === selectedTypeId);
    return typeOption?.label.toLowerCase() === questionTypes.FILL_IN_THE_BLANK.toLowerCase();
  }

  /**
   * Update form validators dynamically based on question type
   */
  updateFieldsBasedOnType(selectedTypeId: number): void {
    const typeOption = this.questionTypeOptions.find((opt) => opt.value === selectedTypeId);
    const typeLabel = typeOption?.label.toLowerCase() || '';
    const correctAnswerControl = this.questionForm.get('correctAnswer');
    if (!correctAnswerControl) return;

    // Correct answer always required
    correctAnswerControl.setValidators([Validators.required]);
    if (typeLabel === questionTypes.TRUE_FALSE.toLowerCase()) {
      correctAnswerControl.setValidators([Validators.required, Validators.pattern(/^\S[\s\S]*$/)]);
      correctAnswerControl.setValue(null); // reset
    } else {
      correctAnswerControl.setValidators([Validators.required, Validators.pattern(/^\S[\s\S]*$/)]);
    }

    // Toggle option fields for multiple-choice
    ['option1', 'option2', 'option3', 'option4'].forEach((opt) => {
      const control = this.questionForm.get(opt);
      if (!control) return;

      if (typeLabel === questionTypes.MULTIPLE_CHOICE.toLowerCase()) {
        control.setValidators([Validators.required, Validators.pattern(/^\S[\s\S]*$/)]);
      } else {
        control.clearValidators();
        control.setValue('');
      }
      control.updateValueAndValidity();
    });

    correctAnswerControl.updateValueAndValidity();
  }

  /**
   * Decide whether to show a given field based on question type
   */
  shouldRenderField(field: DynamicFormField): boolean {
    const selectedTypeId = this.questionForm.get('type')?.value;
    const typeOption = this.questionTypeOptions.find((opt) => opt.value === selectedTypeId);
    const typeLabel = typeOption?.label.toLowerCase() || '';

    const alwaysVisible = ['type', 'difficulty', 'questionText', 'correctAnswer'];
    if (alwaysVisible.includes(field.name)) return true;
    if (['option1', 'option2', 'option3', 'option4'].includes(field.name)) {
      return typeLabel === questionTypes.MULTIPLE_CHOICE.toLowerCase();
    }
    if (field.name === 'correctAnswer' && typeLabel === questionTypes.TRUE_FALSE.toLowerCase())
      return true;

    return false;
  }

  /**
   * Get validation error message for a given form field
   */
  getErrorQuestionForm(fieldName: string): string | null {
    const control = this.questionForm.get(fieldName);
    const field = this.questionFormFieldForAddQuestionManuallyStep3.find(
      (f) => f.name === fieldName,
    );
    const customMessages = field?.validationMessages || {};

    return this.validationErrorService.getErrorMessage(control!, customMessages, fieldName);
  }

  // Get difficulty label from value
  getDifficultyLabel(value: number): string {
    const option = this.questionDifficultyOption.find((opt) => opt.value === value);
    return option?.label || '';
  }

  /**
   * Add a new question to the selectedQuestions list
   * Includes validation and difficulty limit checks
   */
  addQuestion(): void {
    if (this.questionForm.valid) {
      const formValue = this.questionForm.value;

      let queOptionsAns: { id: number; key: string; value: string }[] = [];

      // Build answer set based on type
      switch (formValue.type) {
        case QuestionType.MultipleOptions:
          const options = [
            formValue.option1,
            formValue.option2,
            formValue.option3,
            formValue.option4,
          ];
          if (!options.includes(formValue.correctAnswer)) {
            this.snackbar.showError(quizCRUDMessages.mcqOptionError);
            return;
          }

          const uniqueOptions = new Set(options.map((opt) => opt?.trim().toLowerCase()));
          if (uniqueOptions.size !== options.length) {
            this.snackbar.showError(quizCRUDMessages.notUniqueOptions);
            return;
          }
          queOptionsAns = [
            { id: 1, key: 'option', value: formValue.option1 },
            { id: 2, key: 'option', value: formValue.option2 },
            { id: 3, key: 'option', value: formValue.option3 },
            { id: 4, key: 'option', value: formValue.option4 },
            { id: 5, key: 'answer', value: formValue.correctAnswer },
          ];
          break;

        case QuestionType.TrueFalse:
          queOptionsAns = [
            { id: 1, key: 'answer', value: formValue.correctAnswer ? 'True' : 'False' },
          ];
          break;

        case QuestionType.ShortAnswer:
          queOptionsAns = [{ id: 1, key: 'answer', value: formValue.correctAnswer }];
          break;

        case QuestionType.FillInTheBlank:
          const question = formValue.questionText;
          if (question.includes('{{}}')) {
            const formattedQuestion = question.replace(/\{\{\}\}/g, '__________');
            formValue.questionText = formattedQuestion;
          } else {
            this.snackbar.showError(quizCRUDMessages.fillInTheBlankFormatError);
            return;
          }
          queOptionsAns = [{ id: 1, key: 'answer', value: formValue.correctAnswer }];
          break;

        default:
          return;
      }

      // Create new question object
      const newQuestion: QuestionsList = {
        categoryId: this.battleStep1Data?.categoryId || 0,
        queDifficultyId: formValue.difficulty,
        queDifficultyName: this.getDifficultyLabel(formValue.difficulty),
        queText: formValue.questionText,
        queTypeId: formValue.type,
        queTypeName:
          this.questionTypeOptions.find((opt) => opt.value === formValue.type)?.label || 'Unknown',
        queOptionsAns,
      };

      // ---- Check difficulty limit ----
      const difficultyId = newQuestion.queDifficultyId;
      const difficultyName = newQuestion.queDifficultyName;
      const difficultyEntry = this.battleStep1Data?.questionsDifficulty?.find(
        (d) => d.queDifficultyId === difficultyId,
      );
      const difficultyLimit = difficultyEntry?.noOfQues ?? null;
      const currentCount = this.selectedQuestions.filter(
        (q) => q.queDifficultyId === difficultyId,
      ).length;

      if (difficultyLimit !== null && currentCount >= difficultyLimit) {
        this.snackbar.showError(
          quizCRUDMessages.maxDifficultyQuestionsError(difficultyLimit, difficultyName!),
        );
        return;
      }

      if (!this.selectedQuestions.some((q) => q.queText === newQuestion.queText)) {
        this.selectedQuestions.push(newQuestion);
      } else if (!this.selectedQuestions.some((q) => q.queTypeId === newQuestion.queTypeId)) {
        this.selectedQuestions.push(newQuestion);
      } else {
        this.snackbar.showError(quizCRUDMessages.duplicateQuestionError);
        return;
      }

      // Notify parent
      this.selectedQuestionsChangeFromInnerStep3Option1.emit([...this.selectedQuestions]);

      // Reset form and show success
      this.questionForm.reset();
      this.snackbar.showSuccess(quizCRUDMessages.questionAdded);
    } else {
      // Highlight invalid fields
      this.questionForm.markAllAsTouched();
    }
  }

  /**
   * Load dropdown data into form fields (difficulty & type)
   */
  getDropDownsData() {
    this.questionFormFieldForAddQuestionManuallyStep3 =
      this.questionFormFieldForAddQuestionManuallyStep3.map((field) => {
        if (field.name === 'difficulty') {
          return {
            ...field,
            options: this.questionDifficultyOption || [], // fallback to empty array
          };
        }
        return field;
      });

    this.questionFormFieldForAddQuestionManuallyStep3 =
      this.questionFormFieldForAddQuestionManuallyStep3.map((field) => {
        if (field.name === 'type') {
          return {
            ...field,
            options: this.questionTypeOptions || [], // fallback to empty array
          };
        }
        return field;
      });

    // Default select first type if available
    if (this.questionTypeOptions && this.questionTypeOptions.length > 0) {
      this.questionForm.get('type')?.setValue(this.questionTypeOptions[0].value);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Build reactive form dynamically from config fields
   */
  private buildQuestionForm(): void {
    const group: Record<string, unknown> = {};
    this.questionFormFieldForAddQuestionManuallyStep3.forEach((field) => {
      group[field.name] = ['', field.validators];
    });

    this.questionForm = this.fb.group(group);

    // React to type changes dynamically
    this.questionForm.get('type')?.valueChanges.subscribe((selectedType) => {
      this.updateFieldsBasedOnType(selectedType);
    });
  }
}
