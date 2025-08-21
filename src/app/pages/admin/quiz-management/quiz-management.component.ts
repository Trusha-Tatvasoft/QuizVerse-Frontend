import { Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { CardComponent } from '../../../shared/components/card/card.component';
import { QuizManagementService } from '../../../services/admin/quiz-management/quiz-management.service';
import { debounceTime, forkJoin, Subject, takeUntil } from 'rxjs';
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
  tablePaginationConfig,
} from '../../../utils/constants';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { CommonListDropDown } from '../../../shared/interfaces/common-dropdown.interface';
import { DropDownType } from '../../../shared/enums/dropdown-types.enum';
import { DropdownService } from '../../../shared/service/dropdown/dropdown.service';
import { QuizStatus } from '../../../shared/enums/quiz-management.enum';
import { quizToQuizListingTableData } from './components/quiz-table/quiz-table-data.mapper';

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

  getFilteredQuiz(): void {
    this.searchSubject.pipe(debounceTime(debounceTimeValue)).subscribe(() => {
      this.pagination.set({ ...this.pagination(), pageNumber: 1 });
      this.fetchQuizzes();
    });
  }

  onSearchInputChange(value: string): void {
    this.getFilteredQuiz();
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
}
