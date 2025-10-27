import { Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { CardComponent } from '../../../shared/components/card/card.component';
import { QuizManagementService } from '../../../services/admin/quiz-management/quiz-management.service';
import { debounceTime, distinctUntilChanged, forkJoin, map, Subject, takeUntil } from 'rxjs';
import { QuizManagementSummary } from './interfaces/quiz-management-summary.interface';
import { CardColor } from '../../../utils/types/card-component.type';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { MatSelectModule } from '@angular/material/select';
import {
  createNewQuizButtonConfig,
  quizManagementCardConfig,
  quizManagementHeaderConfig,
  searchInputConfig,
} from './configs/quiz-management.config';
import { FormControl } from '@angular/forms';
import { QuizTableComponent } from './components/quiz-table/quiz-table.component';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import {
  debounceTimeValue,
  platformMessages,
  quizActions,
  tablePaginationConfig,
} from '../../../utils/constants';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { CommonListDropDown } from '../../../shared/interfaces/common-dropdown.interface';
import { DropDownType } from '../../../shared/enums/dropdown-types.enum';
import { DropdownService } from '../../../shared/service/dropdown/dropdown.service';
import { QuizStatus } from '../../../shared/enums/quiz-management.enum';
import { quizToQuizListingTableData } from './components/quiz-table/quiz-table-data.mapper';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import {
  activateQuizDialog,
  deleteQuizDialog,
  inactivateQuizDialog,
} from './configs/quiz-confirmation-dialog.config';
import { Navigations } from '../../../shared/enums/navigation';
import { QuizCreationService } from '../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import {
  QueOptionsAndAnswers,
  QuestionOptionResponseDto,
  QuestionResponseDto,
  QuestionsList,
  QuizResponse,
} from '../../../shared/interfaces/quiz-creation.interface';
import { QuizPreviewComponent } from './components/quiz-preview/quiz-preview.component';
import { getTagConfigWithCustomization } from '../../../utils/quiz-crud-common-functions.utils';
import { DropDownData } from '../../../shared/interfaces/drop-down-data.interface';
import { UserAction } from '../../../shared/enums/user-management.enum';

@Component({
  selector: 'app-quiz-management',
  imports: [
    PageHeaderComponent,
    CardComponent,
    SearchInputComponent,
    MatSelectModule,
    FilledButtonComponent,
    QuizTableComponent,
  ],
  templateUrl: './quiz-management.component.html',
  styleUrl: './quiz-management.component.scss',
})
export class QuizManagementComponent implements OnInit {
  // Inject services
  quizManagementService = inject(QuizManagementService);
  dropdownService = inject(DropdownService);
  snackbar = inject(SnackbarService);
  dialog = inject(MatDialog);
  router = inject(Router);
  quizCreationService = inject(QuizCreationService);

  // Header and button configs
  quizConfig = quizManagementHeaderConfig;
  quizStatsConfigs: CardInputConfig[] = [];
  searchInputConfig = searchInputConfig;
  createNewQuizButtonConfig = createNewQuizButtonConfig;
  valueColor: CardColor = 'black';

  // Search input control
  searchControl = new FormControl<string | null>(null);

  // Filter selections
  selectedStatus: number;
  selectedCategory: number;
  selectedDifficulty: number;

  categoryList: CommonListDropDown[] = [];
  difficultyList: CommonListDropDown[] = [];

  // Table data signals
  dataSource = signal<TableData[]>([]);
  totalItems = signal(0);
  pagination = signal({ pageNumber: 1, pageSize: tablePaginationConfig.PageSize });
  sort = signal({ sortColumn: '', sortDescending: false });

  // Private reactive helpers
  private readonly searchSubject = new Subject<string>();
  private readonly destroy = new Subject<void>();

  quizStatus = Object.keys(QuizStatus)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      label: key,
      value: QuizStatus[key as keyof typeof QuizStatus],
    }));

  ngOnInit(): void {
    this.getFilteredQuiz();
    this.loadDropdowns();
    this.getQuizManagementStats();
    this.fetchQuizzes();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  loadDropdowns() {
    forkJoin({
      categories: this.dropdownService.getDropdownData(DropDownType.QuizCategory),
      difficulties: this.dropdownService.getDropdownData(DropDownType.QuizDifficulty),
    }).subscribe(({ categories, difficulties }) => {
      this.categoryList = categories;
      this.difficultyList = difficulties;
    });
  }

  private getQuizManagementStats(): void {
    this.quizManagementService
      .getQuizManagementStats()
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (res) => {
          if (res.result && res.data) {
            this.quizStatsConfigs = this.mapQuizManagementStatsToCards(res.data);
          }
        },
        error: () => {
          this.quizStatsConfigs = [];
        },
      });
  }

  private mapQuizManagementStatsToCards(data: QuizManagementSummary): CardInputConfig[] {
    const quizManagementCards: CardInputConfig[] = [];

    for (const key in data) {
      const stat = data[key as keyof QuizManagementSummary];
      const config = quizManagementCardConfig[key as keyof QuizManagementSummary];

      quizManagementCards.push({
        title: config.title,
        value: stat,
        subtitle: '',
        valueColor: this.valueColor,
        subtitleColor: this.valueColor,
        icon: config.icon,
        iconColor: config.iconColor,
      });
    }

    return quizManagementCards;
  }

  private getLookupMap(type: DropDownType) {
    return this.quizCreationService.getDropDownData(type).pipe(
      map((response) => {
        const map: Record<number, string> = {};
        response.data?.forEach((item: DropDownData) => (map[item.id] = item.name));
        return map;
      }),
    );
  }

  private mapQuestions(
    questions: QuestionResponseDto[],
    typeMap: Record<number, string>,
  ): QuestionsList[] {
    return questions.map(
      (q): QuestionsList => ({
        id: q.id,
        categoryId: q.categoryId,
        queDifficultyId: q.queDifficultyId,
        queText: q.queText,
        queTypeId: q.queTypeId,
        queTypeName: typeMap[q.queTypeId],
        queOptionsAns: q.queOptionsAns?.map(
          (opt: QuestionOptionResponseDto): QueOptionsAndAnswers => ({
            id: opt.id,
            questionId: opt.questionId,
            key: opt.key,
            value: opt.value,
          }),
        ),
      }),
    );
  }

  getFilteredQuiz(): void {
    this.searchSubject
      .pipe(debounceTime(debounceTimeValue), distinctUntilChanged(), takeUntil(this.destroy))
      .subscribe(() => {
        this.pagination.set({ ...this.pagination(), pageNumber: 1 });
        this.fetchQuizzes();
      });
  }

  onSearchInputChange(value: string): void {
    this.searchSubject.next(value);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pagination.set({ pageNumber: event.pageIndex + 1, pageSize: event.pageSize });
    this.fetchQuizzes();
  }

  onSortChange(event: { active: string; direction: string }) {
    this.sort.set({
      sortColumn: event.active,
      sortDescending: event.direction === 'desc',
    });
    this.fetchQuizzes();
  }

  onFilterChange() {
    this.pagination.set({ ...this.pagination(), pageNumber: 1 });
    this.fetchQuizzes();
  }

  fetchQuizzes() {
    const request: PaginationRequest = {
      ...this.pagination(),
      searchTerm: this.searchControl.value ?? '',
      sortColumn: this.sort().sortColumn,
      sortDescending: this.sort().sortDescending,
      filters: {},
    };

    if (this.selectedStatus) request.filters!['quizStatus'] = Number(this.selectedStatus);
    if (this.selectedCategory) request.filters!['quizCategoryId'] = Number(this.selectedCategory);
    if (this.selectedDifficulty)
      request.filters!['quizDifficultyId'] = Number(this.selectedDifficulty);

    this.quizManagementService
      .getQuizzes(request)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200) {
            this.snackbar.showError(
              res.message || platformMessages.errorMessage,
              `${platformMessages.errorTitle} ${res.statusCode}`,
            );
            this.dataSource.set([]);
            this.totalItems.set(0);
            return;
          }
          this.dataSource.set(res.data.records.map(quizToQuizListingTableData));
          this.totalItems.set(res.data.totalRecords);
        },
        error: (error) => {
          const message = error?.error?.message || error?.message || 'Unexpected error occurred';
          const status = error?.status || 'Unknown';
          this.snackbar.showError(message, `Error ${status}`);
        },
      });
  }

  navigateToQuizCreation(): void {
    this.router.navigate([
      `/${Navigations.Admin}/${Navigations.Quizzes}/${Navigations.QuizCreation}`,
    ]);
  }

  handleQuizAction(event: { action: string; row: TableData }): void {
    const quiz = event.row;
    switch (event.action) {
      case quizActions.VISIBILITY:
        this.previewQuiz(quiz['id'] as number);
        break;
      case quizActions.EDIT:
        // Encode quiz id to base64 and navigate
        const encodedId = btoa((quiz['id'] as number).toString());
        this.router.navigate([
          `/${Navigations.Admin}/${Navigations.Quizzes}/${Navigations.QuizCreation}`,
          encodedId,
        ]);
        break;
      case quizActions.DELETE:
        this.openConfirmationDialog(deleteQuizDialog, () =>
          this.deleteQuiz(quiz['id'] as number, UserAction.Delete),
        );
        break;
      case quizActions.ACTIVATE:
        this.openConfirmationDialog(activateQuizDialog, () =>
          this.deleteQuiz(quiz['id'] as number, UserAction.UpdateStatus, QuizStatus.Active),
        );
        break;
      case quizActions.INACTIVATE:
        this.openConfirmationDialog(inactivateQuizDialog, () =>
          this.deleteQuiz(quiz['id'] as number, UserAction.UpdateStatus, QuizStatus.Inactive),
        );
        break;
    }
  }

  openConfirmationDialog(dialogData: ConfirmationDialogData, onConfirm: () => void): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      disableClose: false,
      data: dialogData,
      panelClass: 'custom-dialog-radius',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) onConfirm();
    });
  }

  deleteQuiz(quizId: number, action: UserAction, newStatus?: QuizStatus): void {
    this.quizManagementService
      .updateQuizAction({ id: quizId, action, newStatus })
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.snackbar.showSuccess(platformMessages.successTitle, res.message);

            // Handle pagination if last item on the last page
            const currentData = this.dataSource();
            const currentPage = this.pagination().pageNumber;

            if (currentData.length === 1 && currentPage > 1) {
              this.pagination.set({
                ...this.pagination(),
                pageNumber: currentPage - 1,
              });
            }

            this.fetchQuizzes();
            this.getQuizManagementStats();
          } else {
            this.snackbar.showError(
              platformMessages.errorTitle,
              res.message || platformMessages.deleteQuizFailure,
            );
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorTitle,
          );
        },
      });
  }

  previewQuiz(quizId: number) {
    this.quizCreationService
      .getQuiz(quizId)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (res) => {
          this.openPreview(res.data);
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  openPreview(quizResponse: QuizResponse) {
    forkJoin({
      typeMap: this.getLookupMap(DropDownType.QuestionType),
      categoryMap: this.getLookupMap(DropDownType.QuizCategory),
    })
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: ({ typeMap, categoryMap }) => {
          const mappedQuestions = this.mapQuestions(quizResponse.questions!, typeMap);

          this.dialog.open(QuizPreviewComponent, {
            width: '800px',
            height: '80vh',
            data: {
              quizName: quizResponse.name,
              description: quizResponse.description,
              tags: [
                getTagConfigWithCustomization(categoryMap[quizResponse.categoryId], false),
                getTagConfigWithCustomization(`${quizResponse.totalTime} minutes`, true),
                getTagConfigWithCustomization(`${quizResponse.totalQuestion} questions`, true),
              ],
              questions: mappedQuestions,
            },
          });
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
