import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import {
  QueOptionsAndAnswers,
  QuestionPoolList,
  QuestionsList,
  QuizStep1Data,
} from '../../../../../shared/interfaces/quiz-creation.interface';
import {
  changeQuestionMethodButtonConfig,
  searchInputConfig,
} from '../../configs/quiz-creation.config';
import {
  platformMessages,
  quizCRUDMessages,
  tablePaginationConfig,
} from '../../../../../utils/constants';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PaginationRequest } from '../../../../../shared/interfaces/pagination-request.interface';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { Subject, takeUntil } from 'rxjs';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import {
  getTagConfigWithDifficulty,
  getTypeTagConfigWithLabel,
} from '../../../../../utils/quiz-crud-common-functions.utils';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { SearchInputComponent } from '../../../../../shared/components/search-input/search-input.component';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-quiz-creation-step-3-option-2',
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
  templateUrl: './quiz-creation-step-3-option-2.component.html',
  styleUrl: './quiz-creation-step-3-option-2.component.scss',
})
export class QuizCreationStep3Option2Component {
  @Input() selectedQuestions: QuestionsList[] = [];
  @Input() quizStep1Data: QuizStep1Data;
  @Input() questionDifficultyOption: { value: number; label: string }[] = [];
  @Output() selectedQuestionsChangeFromInnerStep3Option3 = new EventEmitter<QuestionsList[]>();
  @Output() closeQuestionAdditionOption = new EventEmitter();

  private readonly quizCreationService = inject(QuizCreationService);
  private readonly snackbar = inject(SnackbarService);

  changeMethodButton = changeQuestionMethodButtonConfig;
  pageSizeOptions: number[] = tablePaginationConfig.PageSizeOptions;
  searchInputConfig = searchInputConfig;

  private readonly destroy$ = new Subject<void>();

  pagination = signal({ pageNumber: 1, pageSize: tablePaginationConfig.PageSize });
  sort = signal({ sortColumn: '', sortDescending: false });
  dataSource = signal<QuestionPoolList[]>([]);
  totalItems = signal(0);

  searchValue: string = '';
  selectedDifficulty?: number;

  ngOnInit(): void {
    this.fetchQuestions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeOption() {
    this.closeQuestionAdditionOption.emit();
  }

  searchInputChangeOption2(value: string) {
    this.searchValue = value;
    this.pagination.update((p) => ({ ...p, pageNumber: 1 }));
    this.fetchQuestions();
  }

  filterChangeOption2() {
    this.pagination.update((p) => ({ ...p, pageNumber: 1 }));
    this.fetchQuestions();
  }

  pageChangeOption2(event: PageEvent) {
    this.pagination.set({
      pageNumber: event.pageIndex + 1,
      pageSize: event.pageSize,
    });
    this.fetchQuestions();
  }

  fetchQuestions() {
    const request: PaginationRequest = {
      ...this.pagination(),
      searchTerm: this.searchValue ?? '',
      sortColumn: this.sort().sortColumn,
      sortDescending: this.sort().sortDescending,
      filters: {},
    };

    // Apply filters
    if (this.quizStep1Data.quizCategory) {
      request.filters!['quizCategoryId'] = this.quizStep1Data.quizCategory;
    }
    if (this.selectedDifficulty) {
      request.filters!['questionDifficultyId'] = this.selectedDifficulty;
    }

    this.quizCreationService
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
        error: (err) => {
          const message = err?.error?.message || platformMessages.errorMessage;
          this.snackbar.showError(`${platformMessages.errorTitle} ${err.status}`, message);
        },
      });
  }

  questionSelect(questionId: number, isChecked: boolean) {
    const question = this.dataSource().find((q) => q.id === questionId);
    if (!question) return;

    if (isChecked) {
      const difficultyName = question.queDifficultyName;

      // find the matching difficulty in distribution
      const difficultyEntry = this.quizStep1Data?.difficultyDistribution?.find((d) =>
        d.key.toLowerCase().startsWith(difficultyName?.toLowerCase() ?? ''),
      );
      const difficultyLimit = difficultyEntry?.value ?? null;
      const currentCount = this.selectedQuestions.filter(
        (q) => q.queDifficultyName === difficultyName,
      ).length;

      if (difficultyLimit !== null && currentCount >= difficultyLimit) {
        return;
      }

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
      this.selectedQuestions = this.selectedQuestions.filter((q) => q.id !== questionId);
    }

    this.selectedQuestionsChangeFromInnerStep3Option3.emit([...this.selectedQuestions]);
    this.snackbar.showSuccess(quizCRUDMessages.questionAdded);
  }

  getTypeTagConfigWithLabelInCS(q: string): TagInputConfig {
    return getTypeTagConfigWithLabel(q);
  }

  getTagConfigWithDifficultyInCS(q: string): TagInputConfig {
    return getTagConfigWithDifficulty(q);
  }

  isQuestionDisabled(question: QuestionPoolList): boolean {
    const difficultyName = question.queDifficultyName;

    const difficultyEntry = this.quizStep1Data?.difficultyDistribution?.find((d) =>
      d.key.toLowerCase().startsWith(difficultyName?.toLowerCase() ?? ''),
    );

    const difficultyLimit = difficultyEntry?.value ?? null;

    if (difficultyLimit === null) return false;

    const currentCount = this.selectedQuestions.filter(
      (q) => q.queDifficultyName === difficultyName,
    ).length;

    return currentCount >= difficultyLimit && !this.isQuestionSelected(question.id);
  }

  isQuestionSelected(id: number): boolean {
    return this.selectedQuestions.some((q) => q.id === id);
  }
}
