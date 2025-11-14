import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog'; // <-- ADDED
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import {
  QuestionsList,
  QuizStep1Data
} from '../../../../../shared/interfaces/quiz-creation.interface';
import { Subject, takeUntil, forkJoin, Observable } from 'rxjs';
import { platformMessages, quizCRUDMessages, tablePaginationConfig } from '../../../../../utils/constants';
import { DynamicFormField } from '../../../../../shared/interfaces/dynamic-form-field.interface';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { importQuestionFromWebFormFields, promptTextAreaFormFields, resetBtnConfig } from '../../../question-pool/configs/question-pool.config';
import { importPdfFormFields } from '../../../question-pool/configs/question-pool-dialog.config';
import { DropdownService } from '../../../../../shared/service/dropdown/dropdown.service';
import { DropDownData } from '../../../../../shared/interfaces/drop-down-data.interface';
import { DropDownType } from '../../../../../shared/enums/dropdown-types.enum';
import {
  GenerateQuizRequest,
  QuestionGenerationFormat,
  QuestionPerQuestionType,
  GenerateQuestionFromWebUrlRequest,
  GenerateQuestionFromPromptRequest,
  ImportPreviewDialogData
} from '../../../question-pool/interfaces/question-pool-ai-tab.interface';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { createCategoryTag } from '../../../question-pool/components/ai-question-tab/ai-question-tab.helper';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { ImportQuestionPreviewComponent } from '../../../question-pool/components/manual-question-tab/components/import-question-preview/import-question-preview.component';
import { QuestionPoolListData } from '../../../question-pool/interfaces/question-pool-list-data.interface';
import { QuestionPoolService } from '../../../../../services/admin/question-pool/question-pool.service';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { aiGenerationOptions, columns, deleteQuestionDialog, generateQuestionButtonConfig } from '../../configs/quiz-creation.config';
import { getTagConfigWithDifficulty, getTypeTagConfigWithLabel } from '../../../../../utils/quiz-crud-common-functions.utils';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogData } from '../../../../../shared/interfaces/confirmation-dialog.interface';
import { AIGenerationOption } from '../../interfaces/quiz-management-summary.interface';
import { cancelButton } from '../../../../user/quiz-result-page/configs/quiz-result-buttons.configs';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';

@Component({
  selector: 'app-quiz-creation-step-3-ai-generation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatIcon,
    FilledButtonComponent,
    OutlineButtonComponent,
    TagComponent,
    TableComponent,
  ],
  templateUrl: './quiz-creation-step-3-ai-generation.component.html',
  styleUrl: './quiz-creation-step-3-ai-generation.component.scss',
})
export class QuizCreationStep3AiGenerationComponent implements OnInit {
  @Input() selectedQuestions: QuestionsList[] = [];
  @Input() quizStep1Data!: QuizStep1Data;

  @Output() closeQuestionAdditionOption = new EventEmitter<void>();
  @Output() selectedQuestionsChange = new EventEmitter<QuestionsList[]>();
  @Output() validSelectedQuestionsChange = new EventEmitter<boolean>();

  generationForm: FormGroup;
  specBuilderForm: FormGroup;
  selectedFile: File | null = null;
  pdfContent: string = '';
  selectedGenerationMethod: string = 'text';
  categoryTag: TagInputConfig;

  addedSpecs: QuestionGenerationFormat[] = [];
  difficultyList: DropDownData[] = [];
  typeList: DropDownData[] = [];
  difficultyInfo: { name: string; value: number }[] = [];
  componentQuestions: QuestionsList[] = [];
  questionsTableData: TableData[] = [];

  pageSizeOptions: number[] = tablePaginationConfig.PageSizeOptions;
  pageSizeSelected = tablePaginationConfig.PageSize;
  generateQuestionButtonConfig = generateQuestionButtonConfig;
  cancelButtonConfig = cancelButton;
  resetBtn = resetBtnConfig;
  columns = columns;
  totalGeneratedQuestions = 0;
  currentPageSelected = 1;
  readonly maxAiQuestions = 10;

  aiGenerationOptions: AIGenerationOption[] = aiGenerationOptions;

  private readonly fb = inject(FormBuilder);
  private readonly snackbar = inject(SnackbarService);
  private readonly quizCreationService = inject(QuestionPoolService);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly dropdownService = inject(DropdownService);
  private readonly destroy$ = new Subject<void>();
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.buildGenerationForm();
    this.buildSpecBuilderForm();
    this.loadDropdowns();
    this.componentQuestions = [...this.selectedQuestions];
    this.updateSelectedQuestionsValidity();
  }

  buildDifficultyInfo(): void {
    this.difficultyInfo = (this.quizStep1Data?.difficultyDistribution || [])
      .map((dist) => {
        const key = dist.key.toLowerCase().replace('questions', '');
        const difficulty = this.difficultyList.find((d) => d.name.toLowerCase() === key);
        return {
          name: difficulty?.name || dist.key,
          value: dist.value,
        };
      })
      .filter((info) => info.value > 0);
  }

  loadDropdowns() {
    forkJoin({
      difficulties: this.dropdownService.getDropdownData(DropDownType.QuestionDifficulty),
      types: this.dropdownService.getDropdownData(DropDownType.QuestionType),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ difficulties, types }) => {
        this.difficultyList = difficulties;
        this.typeList = types;
        if (this.quizStep1Data) {
          this.buildDifficultyInfo();
        }
        this.fillMissingLabelsForSelectedQuestions();
      });
  }

  buildGenerationForm(): void {
    this.generationForm = this.fb.group({
      prompt: ['', promptTextAreaFormFields[0].validators],
      url: ['', importQuestionFromWebFormFields[0].validators],
      file: ['', importPdfFormFields[0].validators],
    });
  }

  buildSpecBuilderForm(): void {
    this.specBuilderForm = this.fb.group({
      difficulty: [null, [Validators.required]],
      type: [null, [Validators.required]],
      noOfQuestions: [1, [Validators.required, Validators.min(1)]],
    });
    this.categoryTag = createCategoryTag(this.quizStep1Data.quizCategoryName ?? 'Category');
  }

  getTotalRequired(difficultyId: number): number {
    const difficultyName = this.difficultyList
      .find((d) => d.id === difficultyId)
      ?.name?.toLowerCase();
    if (!difficultyName) return 0;
    const dist = this.quizStep1Data?.difficultyDistribution?.find(
      (d) => d.key.toLowerCase().replace('questions', '') === difficultyName,
    );
    return dist?.value || 0;
  }

  getTotalAddedForDifficulty(difficultyId: number): number {
    const spec = this.addedSpecs.find((s) => s.questionDifficultyId === difficultyId);
    if (!spec) return 0;
    return spec.questionPerQuestionType.reduce((sum, type) => sum + type.noOfQuesitons, 0);
  }

  getTotalAddedOverall(): number {
    return this.addedSpecs.reduce(
      (total, spec) =>
        total +
        spec.questionPerQuestionType.reduce((subSum, type) => subSum + type.noOfQuesitons, 0),
      0,
    );
  }

  onAddSpec(): void {
    this.specBuilderForm.markAllAsTouched();
    if (this.specBuilderForm.invalid) return;

    const difficulty = this.specBuilderForm.get('difficulty')?.value;
    const type = this.specBuilderForm.get('type')?.value;
    const countToAdd = this.specBuilderForm.get('noOfQuestions')?.value;

    // Check against Max 10  que per AI req
    const currentTotal = this.getTotalAddedOverall();
    if (currentTotal + countToAdd > this.maxAiQuestions) {
      this.snackbar.showError(quizCRUDMessages.maxAIGenrationQuestionsError(this.maxAiQuestions, currentTotal));
      return;
    }

    let spec = this.addedSpecs.find((s) => s.questionDifficultyId === difficulty.id);
    if (!spec) {
      spec = {
        questionDifficultyId: difficulty.id,
        questionDifficultyName: difficulty.name,
        questionPerQuestionType: [],
      };
      this.addedSpecs.push(spec);
    }

    const typeExists = spec.questionPerQuestionType.find(
      (t) => t.questionPerQuestionTypeId === type.id,
    );

    if (typeExists) {
      typeExists.noOfQuesitons += countToAdd;
    } else {
      spec.questionPerQuestionType.push({
        questionPerQuestionTypeId: type.id,
        questionPerQuestionTypeName: type.name,
        noOfQuesitons: countToAdd,
      });
    }
    this.specBuilderForm.reset({ noOfQuestions: 1 });
  }

  onRemoveSpec(spec: QuestionGenerationFormat, type: QuestionPerQuestionType): void {
    const typeIndex = spec.questionPerQuestionType.indexOf(type);
    if (typeIndex > -1) {
      spec.questionPerQuestionType.splice(typeIndex, 1);
    }
    if (spec.questionPerQuestionType.length === 0) {
      const specIndex = this.addedSpecs.indexOf(spec);
      if (specIndex > -1) {
        this.addedSpecs.splice(specIndex, 1);
      }
    }
  }

  onResetAll(): void {
    this.addedSpecs = [];
  }

  selectMethod(method: string): void {
    this.selectedGenerationMethod = method;
    this.selectedFile = null;
    this.pdfContent = '';
    this.updateValidators();
  }

  updateValidators(): void {
    const promptControl = this.generationForm.get('prompt');
    const urlControl = this.generationForm.get('url');
    const fileControl = this.generationForm.get('file');

    promptControl?.clearValidators();
    urlControl?.clearValidators();
    fileControl?.clearValidators();

    if (this.selectedGenerationMethod === 'text') {
      promptControl?.setValidators(promptTextAreaFormFields[0].validators as ValidatorFn[]);
    } else if (this.selectedGenerationMethod === 'url') {
      urlControl?.setValidators(importQuestionFromWebFormFields[0].validators as ValidatorFn[]);
    } else if (this.selectedGenerationMethod === 'pdf') {
      fileControl?.setValidators(importPdfFormFields[0].validators as ValidatorFn[]);
    }

    promptControl?.updateValueAndValidity();
    urlControl?.updateValueAndValidity();
    fileControl?.updateValueAndValidity();
  }

  getError(fieldName: string): string | null {
    const control = this.generationForm.get(fieldName);
    if (!control) return null;
    let fields: DynamicFormField[] = [];
    switch (this.selectedGenerationMethod) {
      case 'text':
        fields = promptTextAreaFormFields;
        break;
      case 'url':
        fields = importQuestionFromWebFormFields;
        break;
      case 'pdf':
        fields = importPdfFormFields;
        break;
    }
    const field = fields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages ?? {};
    return this.validationErrorService.getErrorMessage(control, messages, fieldName);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.generationForm.get('file')?.setErrors({ fileType: true });
        this.snackbar.showError(quizCRUDMessages.uploadFileError);
        return;
      }
      this.selectedFile = file;
      this.generationForm.get('file')?.setValue(file.name);
      this.generationForm.get('file')?.markAsTouched();
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('pdfFileInput') as HTMLInputElement;
    fileInput?.click();
  }

  async generateQuestions(): Promise<void> {
    let isSourceValid = false;
    if (this.selectedGenerationMethod === 'text') {
      isSourceValid = this.generationForm.get('prompt')?.valid ?? false;
      if (!isSourceValid) this.generationForm.get('prompt')?.markAsTouched();
    } else if (this.selectedGenerationMethod === 'url') {
      isSourceValid = this.generationForm.get('url')?.valid ?? false;
      if (!isSourceValid) this.generationForm.get('url')?.markAsTouched();
    } else if (this.selectedGenerationMethod === 'pdf') {
      isSourceValid = this.generationForm.get('file')?.valid ?? false;
      if (!isSourceValid) this.generationForm.get('file')?.markAsTouched();
    }

    if (!isSourceValid) {
      this.snackbar.showError(quizCRUDMessages.selectAIGenerationMethod);
      return;
    }

    if (this.addedSpecs.length === 0) {
      this.snackbar.showError(quizCRUDMessages.addAIQueGenerationConfiguration);
      return;
    }

    const basePayload: GenerateQuizRequest = {
      categoryId: this.quizStep1Data.quizCategory,
      category: this.quizStep1Data.quizCategoryName,
      questionSpec: this.addedSpecs,
    };

    let apiCall$: Observable<ApiResponse<QuestionPoolListData[]>>;

    switch (this.selectedGenerationMethod) {
      case 'text':
        const promptPayload: GenerateQuestionFromPromptRequest = {
          ...basePayload,
          prompt: this.generationForm.get('prompt')?.value,
        };

        apiCall$ = this.quizCreationService.generateQuestionsFromTextPrompt(promptPayload);
        break;

      case 'url':
        const urlPayload: GenerateQuestionFromWebUrlRequest = {
          ...basePayload,
          url: this.generationForm.get('url')?.value,
        };

        apiCall$ = this.quizCreationService.getQuestionsUsingWebUrl(urlPayload);
        break;

      case 'pdf':
        if (!this.selectedFile) {
          this.snackbar.showError(quizCRUDMessages.noFileSelectedError);
          return;
        }

        const formData = new FormData();
        formData.append('Prompt', this.selectedFile);
        formData.append('CategoryId', (basePayload.categoryId ?? 0).toString());
        if (basePayload.category) {
          formData.append('Category', basePayload.category);
        }
        formData.append('QuestionSpec', JSON.stringify(basePayload.questionSpec || []));

        apiCall$ = this.quizCreationService.generateQuestionsFromPdf(formData);
        break;

      default:
        this.snackbar.showError(quizCRUDMessages.aiGenMethodError);
        return;
    }

    // 6. Subscribe to the API call
    apiCall$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: ApiResponse<QuestionPoolListData[]>) => {
        if (res.result) {
          this.snackbar.showSuccess(
            platformMessages.successTitle,
            quizCRUDMessages.queGeneratedSUccess,
          );
          this.openPreviewDialog(res.data);
        } else {
          this.snackbar.showError(
            platformMessages.errorTitle,
            res.message || quizCRUDMessages.tryOtherGenSource,
          );
        }
      },
      error: (err) => {
        this.snackbar.showError(
          platformMessages.errorTitle,
          err?.error?.message || quizCRUDMessages.errorWhileQueGeneration,
        );
      },
    });
  }

  close(): void {
    this.closeQuestionAdditionOption.emit();
  }

  updateGeneratedQuestionsTable() {
    const start = (this.currentPageSelected - 1) * this.pageSizeSelected;
    const end = start + this.pageSizeSelected;
    this.questionsTableData = this.componentQuestions.slice(start, end).map((q, index) => ({
      queText: q.queText,
      queTypeName: { tagConfig: this.getTypeTagConfigWithLabelInCS(q.queTypeName!) },
      queDifficultyName: { tagConfig: this.getTagConfigWithDifficultyInCS(q.queDifficultyName!) },
      action: [{ icon: 'delete', tooltip: 'Remove' }],
      index: start + index,
    }));

    if (this.questionsTableData.length === 0 && this.currentPageSelected > 1) {
      this.currentPageSelected = this.currentPageSelected - 1;
    }
    this.totalGeneratedQuestions = this.componentQuestions.length;
    this.selectedQuestionsChange.emit(this.componentQuestions);
  }

  pageChangeTableSelectedQuestions(event: { pageIndex: number; pageSize: number }) {
    this.currentPageSelected = event.pageIndex + 1;
    this.pageSizeSelected = event.pageSize;
    this.updateGeneratedQuestionsTable();
  }

  handleDeleteAction(event: { action: string; row: TableData }): void {
    if (event.action === 'delete') {
      this.openConfirmationDialog(deleteQuestionDialog, () => {
        const index = event.row['index'] as number;
        this.componentQuestions.splice(index, 1);
        this.updateGeneratedQuestionsTable();
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
      this.validSelectedQuestionsChange.emit(isValid);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private openPreviewDialog(questions: QuestionPoolListData[]): void {
    const dialogData: ImportPreviewDialogData = {
      questions: questions,
      isFromQuizCreation: true,
    };

    const dialogRef = this.dialog.open(ImportQuestionPreviewComponent, {
      minWidth: '50vw',
      maxWidth: '100vw',
      maxHeight: '90vh',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (Array.isArray(result) && result.length > 0) {
        const newQuestions = result as QuestionsList[];
        this.componentQuestions.push(...newQuestions);
        this.updateGeneratedQuestionsTable();
        this.updateSelectedQuestionsValidity();
        this.onResetAll();
      }
    });
  }

  private areAllSelectedQuestionsWithinLimit(): boolean {
    if (!this.quizStep1Data) {
      return true;
    }

    const allQuestions = this.componentQuestions;

    const difficultyCounts: Record<string, number> = {};
    allQuestions.forEach((question) => {
      const difficultyName = question.queDifficultyName?.toLowerCase();
      if (!difficultyName) return;
      difficultyCounts[difficultyName] = (difficultyCounts[difficultyName] || 0) + 1;
    });

    // Check for difficulty limits
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
    if (allQuestions.length > totalLimit) {
      return false;
    }

    return true;
  }

  getTypeTagConfigWithLabelInCS(q: string): TagInputConfig {
    return getTypeTagConfigWithLabel(q);
  }

  getTagConfigWithDifficultyInCS(q: string): TagInputConfig {
    return getTagConfigWithDifficulty(q);
  }

  fillMissingLabelsForSelectedQuestions() {
    if (!this.componentQuestions?.length) return;

    this.componentQuestions = this.componentQuestions.map((q) => {
      const updatedQuestion = { ...q };

      // Fill difficulty name if missing
      if (!updatedQuestion.queDifficultyName && this.difficultyList?.length) {
        const difficulty = this.difficultyList.find(
          (d) => d.id === updatedQuestion.queDifficultyId,
        );
        if (difficulty) {
          updatedQuestion.queDifficultyName = difficulty.name;
        }
      }

      // Fill type name if missing
      if (!updatedQuestion.queTypeName && this.typeList?.length) {
        const type = this.typeList.find((t) => t.id === updatedQuestion.queTypeId);
        if (type) {
          updatedQuestion.queTypeName = type.name;
        }
      }
      return updatedQuestion;
    });
    this.updateGeneratedQuestionsTable();
  }
}