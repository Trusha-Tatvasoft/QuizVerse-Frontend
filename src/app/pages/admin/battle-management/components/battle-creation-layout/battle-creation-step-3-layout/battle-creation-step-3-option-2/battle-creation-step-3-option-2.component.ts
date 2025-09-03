import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { OutlineButtonComponent } from '../../../../../../../shared/components/outline-button/outline-button.component';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SearchInputComponent } from '../../../../../../../shared/components/search-input/search-input.component';
import { TagComponent } from '../../../../../../../shared/components/tag/tag.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  BattleStep1Data,
  QueOptionsAndAnswers,
  QuestionPoolList,
  QuestionsList,
} from '../../../../interfaces/battle-creation.interface';
import { BattleManagementService } from '../../../../../../../services/admin/battle-management/battle-management.service';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { changeQuestionMethodButtonConfig } from '../../../../../quiz-management/configs/quiz-creation.config';
import {
  debounceTimeValue,
  quizCRUDMessages,
  tablePaginationConfig,
} from '../../../../../../../utils/constants';
import { searchInputConfig } from '../../../../../question-pool/configs/question-pool.config';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { PaginationRequest } from '../../../../../../../shared/interfaces/pagination-request.interface';
import {
  getTagConfigWithDifficulty,
  getTypeTagConfigWithLabel,
} from '../../../../../../../utils/quiz-crud-common-functions.utils';
import { TagInputConfig } from '../../../../../../../shared/interfaces/tag-component.interface';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-battle-creation-step-3-option-2',
  imports: [
    OutlineButtonComponent,
    MatSelect,
    MatPaginator,
    SearchInputComponent,
    MatOption,
    TagComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatCheckboxModule,
  ],
  templateUrl: './battle-creation-step-3-option-2.component.html',
  styleUrl: './battle-creation-step-3-option-2.component.scss',
})
export class BattleCreationStep3Option2Component {
  // Inputs from parent
  @Input() selectedQuestions: QuestionsList[] = [];
  @Input() battleStep1Data: BattleStep1Data;
  @Input() questionDifficultyOption: { value: number; label: string }[] = [];

  @Output() selectedQuestionsChangeFromInnerStep3Option2 = new EventEmitter<QuestionsList[]>(); // Output: notify parent when questions are updated
  @Output() closeQuestionAdditionOption = new EventEmitter(); // Output: notify parent to close this option UI

  // Configurations
  changeMethodButton = changeQuestionMethodButtonConfig;
  pageSizeOptions: number[] = tablePaginationConfig.PageSizeOptions;
  searchInputConfig = searchInputConfig;

  // State signals
  pagination = signal({ pageNumber: 1, pageSize: tablePaginationConfig.PageSize });
  sort = signal({ sortColumn: '', sortDescending: false });
  dataSource = signal<QuestionPoolList[]>([]);
  totalItems = signal(0);

  // Form controls
  searchControl = new FormControl<string | null>(null);
  selectedDifficulty?: number;

  // Services
  private readonly battleManagementService = inject(BattleManagementService);
  private readonly snackbar = inject(SnackbarService);

  // RxJS subjects for cleanup and search debounce
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.fetchQuestions();
  }

  // Emits close event to parent
  closeOption() {
    this.closeQuestionAdditionOption.emit();
  }

  // Setup search with debounce and reset page number
  getSearchedQuestions(): void {
    this.searchSubject
      .pipe(debounceTime(debounceTimeValue), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pagination.update((p) => ({ ...p, pageNumber: 1 }));
        this.fetchQuestions();
      });
  }

  // Called when search input changes
  searchInputChangeOption2(value: string) {
    this.getSearchedQuestions();
    this.searchSubject.next(value);
  }

  // Called when difficulty filter changes
  filterChangeOption2() {
    this.pagination.update((p) => ({ ...p, pageNumber: 1 }));
    this.fetchQuestions();
  }

  // Handles paginator page change
  pageChangeOption2(event: PageEvent) {
    this.pagination.set({
      pageNumber: event.pageIndex + 1,
      pageSize: event.pageSize,
    });
    this.fetchQuestions();
  }

  // Fetch questions from API with pagination, search & filters
  fetchQuestions() {
    const request: PaginationRequest = {
      ...this.pagination(),
      searchTerm: this.searchControl.value ?? '',
      sortColumn: this.sort().sortColumn,
      sortDescending: this.sort().sortDescending,
      filters: {},
    };

    // Apply filters
    if (this.battleStep1Data.categoryId) {
      request.filters!['quizCategoryId'] = this.battleStep1Data.categoryId;
    }
    if (this.selectedDifficulty) {
      request.filters!['questionDifficultyId'] = this.selectedDifficulty;
    }

    this.battleManagementService
      .getQuestions(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200) {
            this.snackbar.showError(res.message);
            this.dataSource.set([]);
            this.totalItems.set(0);
            return;
          }
          this.dataSource.set(res.data.records);
          this.totalItems.set(res.data.totalRecords);
        },
        error: (error) => {
          const message = error?.error?.message || error?.message || 'Unexpected error occurred';
          const status = error?.status || 'Unknown';
          this.snackbar.showError(message, `Error ${status}`);
        },
      });
  }

  // Handles question selection/deselection
  questionSelect(questionId: number, isChecked: boolean) {
    const question = this.dataSource().find((q) => q.id === questionId);
    if (!question) return;

    if (isChecked) {
      const difficultyId = question.queDifficultyId;

      // Find difficulty distribution entry
      const difficultyEntry = this.battleStep1Data?.questionsDifficulty?.find(
        (d) => d.queDifficultyId === difficultyId,
      );
      const difficultyLimit = difficultyEntry?.noOfQues ?? null;
      const currentCount = this.selectedQuestions.filter(
        (q) => q.queDifficultyId === difficultyId,
      ).length;

      // Prevent exceeding limit
      if (difficultyLimit !== null && currentCount >= difficultyLimit) {
        return;
      }

      // Add question to selected list
      this.selectedQuestions.push({
        id: question.id,
        categoryId: question.categoryId,
        queDifficultyId: question.queDifficultyId,
        queDifficultyName: question.queDifficultyName,
        queText: question.queText,
        queTypeId: question.queTypeId,
        queTypeName: question.queTypeName,
        queOptionsAns: question.queOptionsAns?.map((opt: QueOptionsAndAnswers) => ({
          id: opt.id,
          questionId: opt.questionId,
          key: opt.key ?? '',
          value: String(opt.value ?? ''),
        })),
      });
    } else {
      // Remove question if unchecked
      this.selectedQuestions = this.selectedQuestions.filter((q) => q.id !== questionId);
    }

    // Emit updated selection
    this.selectedQuestionsChangeFromInnerStep3Option2.emit([...this.selectedQuestions]);
    this.snackbar.showSuccess(quizCRUDMessages.questionAdded);
  }

  // Wrapper for type tag config
  getTypeTagConfigWithLabelInCS(q: string): TagInputConfig {
    return getTypeTagConfigWithLabel(q);
  }

  // Wrapper for difficulty tag config
  getTagConfigWithDifficultyInCS(q: string): TagInputConfig {
    return getTagConfigWithDifficulty(q);
  }

  // Disable questions if limit for difficulty is reached
  isQuestionDisabled(question: QuestionPoolList): boolean {
    const difficultyId = question.queDifficultyId;

    const difficultyEntry = this.battleStep1Data?.questionsDifficulty?.find(
      (d) => d.queDifficultyId === difficultyId,
    );

    const difficultyLimit = difficultyEntry?.noOfQues ?? null;

    if (difficultyLimit === null) return false;

    const currentCount = this.selectedQuestions.filter(
      (q) => q.queDifficultyId === difficultyId,
    ).length;

    return currentCount >= difficultyLimit && !this.isQuestionSelected(question.id);
  }

  // Check if question is already selected
  isQuestionSelected(id: number): boolean {
    return this.selectedQuestions.some((q) => q.id === id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
