import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import {
  addCategoryButtonConfig,
  searchInputConfig,
  quizCategoryHeaderConfig,
} from './configs/quiz-category-management.config';
import { FormControl } from '@angular/forms';
import { QuizCategoryTableComponent } from './components/quiz-category-table/quiz-category-table.component';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import {
  debounceTimeValue,
  platformMessages,
  tablePaginationConfig,
} from '../../../utils/constants';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { categoryToCategoryTableData } from './components/quiz-category-table/quiz-category-table.mapper';
import { QuizCategoryManagementService } from '../../../services/admin/quiz-category-management/quiz-category-management.service';

@Component({
  selector: 'app-quiz-categories-management',
  imports: [
    PageHeaderComponent,
    SearchInputComponent,
    FilledButtonComponent,
    QuizCategoryTableComponent,
  ],
  templateUrl: './quiz-categories-management.component.html',
  styleUrl: './quiz-categories-management.component.scss',
})
export class QuizCategoriesManagementComponent implements OnInit, OnDestroy {
  // Inject services
  quizCategoryService = inject(QuizCategoryManagementService);
  snackbar = inject(SnackbarService);

  // Header and button configs
  quizCategoryConfig = quizCategoryHeaderConfig;
  searchInputConfig = searchInputConfig;
  addCategoryButtonConfig = addCategoryButtonConfig;

  // Search input control
  searchControl = new FormControl<string | null>(null);

  // Table data signals
  dataSource = signal<TableData[]>([]);
  totalItems = signal(0);
  pagination = signal({ pageNumber: 1, pageSize: tablePaginationConfig.PageSize });
  sort = signal({ sortColumn: '', sortDescending: false });

  private readonly searchSubject$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.fetchQuizCategories();
  }

  getFilteredData(): void {
    this.searchSubject$.pipe(debounceTime(debounceTimeValue)).subscribe(() => {
      this.pagination.set({ ...this.pagination(), pageNumber: 1 });
      this.fetchQuizCategories();
    });
  }

  onSearchInputChange(value: string): void {
    this.getFilteredData();
    this.searchSubject$.next(value);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pagination.set({ pageNumber: event.pageIndex + 1, pageSize: event.pageSize });
    this.fetchQuizCategories();
  }

  onSortChange(event: { active: string; direction: string }) {
    this.sort.set({
      sortColumn: event.active,
      sortDescending: event.direction === 'desc',
    });
    this.fetchQuizCategories();
  }

  // Fetch category list with sort, pagination
  fetchQuizCategories() {
    const request: PaginationRequest = {
      ...this.pagination(),
      searchTerm: this.searchControl.value ?? '',
      sortColumn: this.sort().sortColumn,
      sortDescending: this.sort().sortDescending,
    };

    this.quizCategoryService
      .getQuizCategoryList(request)
      .pipe(takeUntil(this.destroy$))
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
          this.dataSource.set(res.data.records.map(categoryToCategoryTableData));
          this.totalItems.set(res.data.totalRecords);
        },
        error: (error) => {
          const message = error?.error?.message || error?.message || 'Unexpected error occurred';
          this.snackbar.showError(`Error`, message);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
