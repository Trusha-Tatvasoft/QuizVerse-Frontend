import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import {
  platformMessages,
  quizCRUDMessages,
  tablePaginationConfig,
} from '../../../../../utils/constants';
import {
  addQuestionButtonConfig,
  changeQuestionMethodButtonConfig,
  changeQuestionMethodSmallButtonConfig,
  columns,
  deleteQuestionDialog,
  questionAdditionOptionsInManualMethod,
  questionFormFieldForAddQuestionManually,
  quizCreationFormFields,
  searchInputConfig,
} from '../../configs/quiz-creation.config';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { DynamicFormField } from '../../../../../shared/interfaces/dynamic-form-field.interface';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { MatIcon } from '@angular/material/icon';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { MatInputModule } from '@angular/material/input';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import {
  QuestionPoolList,
  QuestionsList,
  QuizStep1Data,
} from '../../../../../shared/interfaces/quiz-creation.interface';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { Subject, takeUntil } from 'rxjs';
import {
  getTagConfigWithDifficulty,
  getTypeTagConfigWithLabel,
} from '../../../../../utils/quiz-crud-common-functions.utils';
import { QuizCreationStep3Option3Component } from '../quiz-creation-step-3-option-3/quiz-creation-step-3-option-3.component';
import { QuizCreationStep3Option2Component } from '../quiz-creation-step-3-option-2/quiz-creation-step-3-option-2.component';
import { ConfirmationDialogData } from '../../../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DropDownType } from '../../../../../shared/enums/dropdown-types.enum';
import { QuestionType } from '../../../../../shared/enums/quiz-management.enum';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-quiz-creation-step-3-layout',
  imports: [
    ReactiveFormsModule,
    TableComponent,
    MatSelectModule,
    MatOptionModule,
    CommonModule,
    OutlineButtonComponent,
    MatIcon,
    TagComponent,
    MatInputModule,
    FilledButtonComponent,
    QuizCreationStep3Option3Component,
    QuizCreationStep3Option2Component,
  ],
  templateUrl: './quiz-creation-step-3-layout.component.html',
  styleUrl: './quiz-creation-step-3-layout.component.scss',
})
export class QuizCreationStep3LayoutComponent {
  @Input() selectedQuestions: QuestionsList[] = [];
  @Input() quizStep1Data: QuizStep1Data;
  @Input() isValidSelectedQuestions = false;

  @Output() selectedQuestionsChange = new EventEmitter<QuestionsList[]>();
  @Output() validSelectedQuestionsChange = new EventEmitter<boolean>();

  changeMethodButton = changeQuestionMethodButtonConfig;
  changeMethodSmallButton = changeQuestionMethodSmallButtonConfig;
  searchInputConfig = searchInputConfig;
  questionAdditionOptionsInManualMethodStep3 = questionAdditionOptionsInManualMethod;
  questionFormFieldForAddQuestionManuallyStep3 = questionFormFieldForAddQuestionManually;
  addQuestionButton = addQuestionButtonConfig;
  newQuizFields = quizCreationFormFields;
  questionsTableData: TableData[] = [];
  columns = columns;
  pageSizeOptions: number[] = tablePaginationConfig.PageSizeOptions;
  pageSizeSelected = tablePaginationConfig.PageSize;
  questionForm: FormGroup;

  selectedQuestionMethodInManualAdditionIndex: number;

  dataSource = signal<QuestionPoolList[]>([]);
  totalItems = signal(0);
  questionDifficultyOption: { value: number; label: string }[] = [];
  questionTypeOptions: { value: number; label: string }[] = [];
  isInnerStep3: boolean = false;
  isSmallScreen = false;

  selectedQuestionsTableData: QuestionsList[] = [];
  totalQuestionsSelected = 0;
  currentPageSelected = 1;

  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly quizCreationService = inject(QuizCreationService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);
  private readonly breakpointObserver = inject(BreakpointObserver);

  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    // Apply initial logic
    this.buildQuestionForm();
    this.updateFieldsBasedOnType(this.questionForm.get('type')?.value);
    this.getDropDownsData();
    this.updateSelectedQuestionsValidity();

    this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isSmallScreen = result.matches;
      });
  }

  fillMissingLabelsForSelectedQuestions() {
    if (!this.selectedQuestions?.length) return;

    this.selectedQuestions = this.selectedQuestions.map((q) => {
      const updatedQuestion = { ...q };

      // Fill difficulty name if missing
      if (!updatedQuestion.queDifficultyName && this.questionDifficultyOption?.length) {
        const difficulty = this.questionDifficultyOption.find(
          (d) => d.value === updatedQuestion.queDifficultyId,
        );
        if (difficulty) {
          updatedQuestion.queDifficultyName = difficulty.label;
        }
      }

      // Fill type name if missing
      if (!updatedQuestion.queTypeName && this.questionTypeOptions?.length) {
        const type = this.questionTypeOptions.find((t) => t.value === updatedQuestion.queTypeId);
        if (type) {
          updatedQuestion.queTypeName = type.label;
        }
      }
      return updatedQuestion;
    });
    // Update table/UI if needed
    this.updateSelectedQuestionsTable();
  }

  isTrueFalseType(): boolean {
    const selectedTypeId = this.questionForm.get('type')?.value;
    const typeOption = this.questionTypeOptions.find((opt) => opt.value === selectedTypeId);
    return typeOption?.label.toLowerCase() === 'true/false';
  }

  isFillInTheBlanksType(): boolean {
    const selectedTypeId = this.questionForm.get('type')?.value;
    const typeOption = this.questionTypeOptions.find((opt) => opt.value === selectedTypeId);
    return typeOption?.label.toLowerCase() === 'fill in the blank';
  }

  updateFieldsBasedOnType(selectedTypeId: number): void {
    const typeOption = this.questionTypeOptions.find((opt) => opt.value === selectedTypeId);
    const typeLabel = typeOption?.label.toLowerCase() || '';
    const correctAnswerControl = this.questionForm.get('correctAnswer');
    if (!correctAnswerControl) return;

    if (typeLabel === 'true/false') {
      correctAnswerControl.setValidators([Validators.required, Validators.pattern(/^\S[\s\S]*$/)]);
      correctAnswerControl.setValue(null); // reset
    } else {
      correctAnswerControl.setValidators([Validators.required, Validators.pattern(/^\S[\s\S]*$/)]);
    }

    ['option1', 'option2', 'option3', 'option4'].forEach((opt) => {
      const control = this.questionForm.get(opt);
      if (!control) return;

      if (typeLabel === 'multiple choice') {
        control.setValidators([Validators.required, Validators.pattern(/^\S[\s\S]*$/)]);
      } else {
        control.clearValidators();
        control.setValue('');
      }
      control.updateValueAndValidity();
    });

    correctAnswerControl.updateValueAndValidity();
  }

  shouldRenderField(field: DynamicFormField): boolean {
    const selectedTypeId = this.questionForm.get('type')?.value;
    const typeOption = this.questionTypeOptions.find((opt) => opt.value === selectedTypeId);
    const typeLabel = typeOption?.label.toLowerCase() || '';

    const alwaysVisible = ['type', 'difficulty', 'questionText', 'correctAnswer'];
    if (alwaysVisible.includes(field.name)) return true;
    if (['option1', 'option2', 'option3', 'option4'].includes(field.name)) {
      return typeLabel === 'multiple choice';
    }
    if (field.name === 'correctAnswer' && typeLabel === 'true/false') return true;

    return false;
  }

  getTypeTagConfigWithLabelInCS(q: string): TagInputConfig {
    return getTypeTagConfigWithLabel(q);
  }

  getTagConfigWithDifficultyInCS(q: string): TagInputConfig {
    return getTagConfigWithDifficulty(q);
  }

  cardClick(index: number): void {
    this.selectedQuestionMethodInManualAdditionIndex = index;
    this.isInnerStep3 = true;
  }

  getErrorQuestionForm(fieldName: string): string | null {
    const control = this.questionForm.get(fieldName);
    const field = this.questionFormFieldForAddQuestionManuallyStep3.find(
      (f) => f.name === fieldName,
    );
    const customMessages = field?.validationMessages || {};

    return this.validationErrorService.getErrorMessage(control!, customMessages, fieldName);
  }

  getDifficultyLabel(value: number): string {
    const option = this.questionDifficultyOption.find((opt) => opt.value === value);
    return option!.label;
  }

  addQuestion(): void {
    if (this.questionForm.valid) {
      const formValue = this.questionForm.value;

      let queOptionsAns: { id: number; key: string; value: string }[] = [];

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

      const newQuestion: QuestionsList = {
        categoryId: this.quizStep1Data?.quizCategory || 0,
        queDifficultyId: formValue.difficulty,
        queDifficultyName: this.getDifficultyLabel(formValue.difficulty),
        queText: formValue.questionText,
        queTypeId: formValue.type,
        queTypeName:
          this.questionTypeOptions.find((opt) => opt.value === formValue.type)?.label || 'Unknown',
        queOptionsAns,
      };

      // ---- Limit check before adding ----
      const difficultyName = newQuestion.queDifficultyName;
      const difficultyEntry = this.quizStep1Data?.difficultyDistribution?.find((d) =>
        d.key.toLowerCase().startsWith(difficultyName?.toLowerCase() ?? ''),
      );
      const difficultyLimit = difficultyEntry?.value ?? null;

      const currentCount = this.selectedQuestions.filter(
        (q) => q.queDifficultyName === difficultyName,
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

      this.totalQuestionsSelected = this.selectedQuestions.length;
      this.updateSelectedQuestionsTable();
      this.questionForm.reset();
      this.snackbar.showSuccess(quizCRUDMessages.questionAdded);
    } else {
      this.questionForm.markAllAsTouched();
    }
  }

  //Data from db
  getDropDownsData() {
    this.quizCreationService
      .getDropDownData(DropDownType.QuestionDifficulty)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.data)) {
            this.questionDifficultyOption = response.data.map((item) => ({
              value: item.id,
              label: item.name,
            }));
          }
          this.questionFormFieldForAddQuestionManuallyStep3 =
            this.questionFormFieldForAddQuestionManuallyStep3.map((field) => {
              if (field.name === 'difficulty') {
                return {
                  ...field,
                  options: this.questionDifficultyOption,
                };
              }
              return field;
            });
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });

    this.quizCreationService
      .getDropDownData(DropDownType.QuestionType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.data)) {
            this.questionTypeOptions = response.data.map((item) => ({
              value: item.id,
              label: item.name,
            }));
          }
          this.questionFormFieldForAddQuestionManuallyStep3 =
            this.questionFormFieldForAddQuestionManuallyStep3.map((field) => {
              if (field.name === 'type') {
                return {
                  ...field,
                  options: this.questionTypeOptions,
                };
              }
              return field;
            });
          this.questionForm.get('type')?.setValue(this.questionTypeOptions[0].value);
          this.fillMissingLabelsForSelectedQuestions();
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  isQuestionSelected(id: number): boolean {
    return this.selectedQuestions.some((q) => q.id === id);
  }

  updateSelectedQuestionsTable() {
    const start = (this.currentPageSelected - 1) * this.pageSizeSelected;
    const end = start + this.pageSizeSelected;
    this.questionsTableData = this.selectedQuestions.slice(start, end).map((q, index) => ({
      queText: q.queText,
      queTypeName: { tagConfig: this.getTypeTagConfigWithLabelInCS(q.queTypeName!) },
      queDifficultyName: { tagConfig: this.getTagConfigWithDifficultyInCS(q.queDifficultyName!) },
      action: [{ icon: 'delete', tooltip: 'Delete Question' }],
      index: start + index,
    }));
    if (this.questionsTableData.length === 1 && this.currentPageSelected > 1) {
      this.currentPageSelected = this.currentPageSelected - 1;
    }
    this.totalQuestionsSelected = this.selectedQuestions.length;
    this.selectedQuestionsChange.emit(this.selectedQuestions);

    this.updateSelectedQuestionsValidity();
  }

  pageChangeTableSelectedQuestions(event: { pageIndex: number; pageSize: number }) {
    this.currentPageSelected = event.pageIndex + 1;
    this.pageSizeSelected = event.pageSize;
    this.updateSelectedQuestionsTable();
  }

  handleDeleteAction(event: { action: string; row: TableData }): void {
    if (event.action === 'delete') {
      this.openConfirmationDialog(deleteQuestionDialog, () => {
        const index = event.row['index'] as number;
        this.selectedQuestions.splice(index, 1);

        this.totalQuestionsSelected = this.selectedQuestions.length;
        this.updateSelectedQuestionsTable();
      });
    }
  }

  openConfirmationDialog(dialogData: ConfirmationDialogData, onConfirm: () => void): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      disableClose: true,
      data: dialogData,
      panelClass: 'custom-dialog-radius',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) onConfirm();
    });
  }

  updateSelectedQuestionsValidity(): void {
    const isValid = this.areAllSelectedQuestionsWithinLimit();
    setTimeout(() => {
      this.isValidSelectedQuestions = isValid;
      this.validSelectedQuestionsChange.emit(this.isValidSelectedQuestions);
    });
  }

  selectedQuestionsChangeFromInnerStep3Option3Parent(questions: QuestionsList[]) {
    this.selectedQuestions = [...questions];
    this.totalQuestionsSelected = this.selectedQuestions.length;
    this.fillMissingLabelsForSelectedQuestions();
    this.updateSelectedQuestionsTable();
  }

  closeQuestionAdditionOptionParent() {
    this.isInnerStep3 = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildQuestionForm(): void {
    const group: Record<string, unknown> = {};
    this.questionFormFieldForAddQuestionManuallyStep3.forEach((field) => {
      group[field.name] = ['', field.validators];
    });

    this.questionForm = this.fb.group(group);

    // React to type changes
    this.questionForm.get('type')?.valueChanges.subscribe((selectedType) => {
      this.updateFieldsBasedOnType(selectedType);
    });
  }

  private areAllSelectedQuestionsWithinLimit(): boolean {
    if (!this.quizStep1Data || !Array.isArray(this.selectedQuestions)) {
      return true;
    }

    // Count selected questions by difficulty
    const difficultyCounts: Record<string, number> = {};
    this.selectedQuestions.forEach((question) => {
      const difficultyName = question.queDifficultyName?.toLowerCase();
      if (!difficultyName) return;
      difficultyCounts[difficultyName] = (difficultyCounts[difficultyName] || 0) + 1;
    });

    for (const dist of this.quizStep1Data?.difficultyDistribution ?? []) {
      const difficultyName = dist.key.replace('Questions', '');
      const difficultyLimit = Number(dist.value ?? 0);
      const count = difficultyCounts[difficultyName] ?? 0;
      if (count > difficultyLimit) {
        return false;
      }
    }

    // Check total questions limit
    const totalLimit = Number(this.quizStep1Data.totalQuestions ?? 0);
    if (this.selectedQuestions.length > totalLimit) {
      return false;
    }
    return true;
  }
}
