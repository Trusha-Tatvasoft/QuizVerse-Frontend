import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import {
  addCategoryButtonConfig,
  searchInputConfig,
  quizCategoryHeaderConfig,
  quizCategoryAction,
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
import { AddEditQuizCategoryComponent } from './components/add-edit-quiz-category/add-edit-quiz-category.component';
import { MatDialog } from '@angular/material/dialog';
import { CategoryPreviewComponent } from './components/category-preview/category-preview.component';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  activateQuizCategoryConfig,
  deleteQuizCategoryConfig,
  inActivateQuizCategoryConfig,
} from './configs/quiz-category-confirmation-dialog.config';
import { QuizCategoryAction, QuizCategoryStatus } from '../../../shared/enums/quiz-category.enum';
import { QuizCategoryList } from './interface/quiz-category-list-data.interface';

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
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.getFilteredData();
    this.fetchQuizCategories();
  }

  getFilteredData(): void {
    this.searchSubject$.pipe(debounceTime(debounceTimeValue)).subscribe(() => {
      this.pagination.set({ ...this.pagination(), pageNumber: 1 });
      this.fetchQuizCategories();
    });
  }

  onSearchInputChange(value: string): void {
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

  handleCategoryAction(event: { action: string; row: TableData }) {
    const category = event.row;

    switch (event.action) {
      case quizCategoryAction.EDIT:
        this.loadQuizCategoryForEdit(category['id'] as number);
        break;

      case quizCategoryAction.PREVIEW:
        this.loadQuizPreview(category['id'] as number);
        break;

      case quizCategoryAction.DELETE:
        this.openConfirmationDialog(deleteQuizCategoryConfig, () =>
          this.updateQuizCategoryStatus(category['id'] as number, QuizCategoryAction.Delete),
        );
        break;

      case quizCategoryAction.INACTIVATE:
        this.openConfirmationDialog(inActivateQuizCategoryConfig, () =>
          this.updateQuizCategoryStatus(
            category['id'] as number,
            QuizCategoryAction.UpdateStatus,
            QuizCategoryStatus.Inactive,
          ),
        );
        break;

      case quizCategoryAction.ACTIVATE:
        this.openConfirmationDialog(activateQuizCategoryConfig, () =>
          this.updateQuizCategoryStatus(
            category['id'] as number,
            QuizCategoryAction.UpdateStatus,
            QuizCategoryStatus.Active,
          ),
        );
        break;
    }
  }

  loadQuizCategoryForEdit(id: number) {
    this.quizCategoryService
      .getCategoryById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200 && res.data) {
            this.openAddOrEditCategory(res.data);
          } else {
            this.snackbar.showError(
              platformMessages.errorMessage,
              res.message || platformMessages.notFoundTitle,
            );
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

  openAddOrEditCategory(categoryData?: QuizCategoryList): void {
    const dialogRef = this.dialog.open(AddEditQuizCategoryComponent, {
      width: '600px',
      disableClose: false,
      panelClass: 'custom-dialog-radius',
    });

    dialogRef.componentInstance.data = categoryData ?? null;

    dialogRef.componentInstance.close.subscribe((result) => {
      dialogRef.close(result); // forward event so afterClosed still works
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.refresh) {
        this.fetchQuizCategories();
      }
    });
  }

  loadQuizPreview(id: number) {
    this.quizCategoryService
      .getCategoryById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200 && res.data) {
            this.openPreviewDialog(res.data);
          } else {
            this.snackbar.showError(
              platformMessages.errorTitle,
              res.message || platformMessages.notFoundTitle,
            );
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

  openPreviewDialog(categoryData: QuizCategoryList) {
    const dialogRef = this.dialog.open(CategoryPreviewComponent, {
      width: '600px',
      disableClose: false,
      panelClass: 'custom-dialog-radius',
    });

    dialogRef.componentInstance.data = categoryData;

    dialogRef.componentInstance.close.subscribe(() => {
      dialogRef.close();
    });
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

  updateQuizCategoryStatus(
    categoryId: number,
    action: QuizCategoryAction,
    newStatus?: QuizCategoryStatus,
  ): void {
    const payload: { id: number; action: number; newStatus?: number } = {
      id: categoryId,
      action,
    };

    if (newStatus !== undefined) {
      payload.newStatus = newStatus; // only set if defined
    }

    this.quizCategoryService
      .updateQuizCategoryByAction(payload as { id: number; action: number; newStatus: number })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200) {
            this.snackbar.showError(platformMessages.errorTitle, res.message);
            return;
          }
          const currentData = this.dataSource();
          const currentPage = this.pagination().pageNumber;

          if (currentData.length === 1 && currentPage > 1) {
            this.pagination.set({ ...this.pagination(), pageNumber: currentPage - 1 });
          }

          this.snackbar.showSuccess(platformMessages.successTitle, res.message);
          // Refresh table
          this.fetchQuizCategories();
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
