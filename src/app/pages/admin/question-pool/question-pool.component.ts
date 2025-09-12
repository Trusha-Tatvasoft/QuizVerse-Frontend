import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import {
  addQuestionButtonConfig,
  deleteQuestionDialog,
  questionPoolHeaderConfig,
  searchInputConfig,
} from './configs/question-pool.config';
import { FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { QuestionPoolListingComponent } from './components/question-pool-listing/question-pool-listing.component';
import { DropdownService } from '../../../shared/service/dropdown/dropdown.service';
import { debounceTime, forkJoin, Subject, takeUntil } from 'rxjs';
import { DropDownType } from '../../../shared/enums/dropdown-types.enum';
import { CommonListDropDown } from '../../../shared/interfaces/common-dropdown.interface';
import { QuestionPoolService } from '../../../services/admin/question-pool/question-pool.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import {
  debounceTimeValue,
  platformMessages,
  questionAction,
  tablePaginationConfig,
} from '../../../utils/constants';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { questionPoolToTableData } from './components/question-pool-listing/question-pool-listing.mapper';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { QuestionPreviewDialogComponent } from './components/question-preview-dialog/question-preview-dialog.component';
import { QuestionFormDialogComponent } from './components/question-form-dialog/question-form-dialog.component';

@Component({
  selector: 'app-question-pool',
  imports: [
    PageHeaderComponent,
    SearchInputComponent,
    FilledButtonComponent,
    MatSelectModule,
    QuestionPoolListingComponent,
  ],
  templateUrl: './question-pool.component.html',
  styleUrl: './question-pool.component.scss',
})
export class QuestionPoolComponent implements OnInit, OnDestroy {
  //#region Variables
  // Inject services
  private readonly questionPoolService = inject(QuestionPoolService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dropdownService = inject(DropdownService);
  private readonly dialog = inject(MatDialog);

  // Header and button configs
  questionPoolConfig = questionPoolHeaderConfig;
  searchInputConfig = searchInputConfig;
  addQuestionButtonConfig = addQuestionButtonConfig;

  // Search input control
  searchControl = new FormControl<string | null>(null);

  // Filter selections
  selectedCategory: number;
  selectedDifficulty: number;
  selectedType: number;

  categoryList: CommonListDropDown[] = [];
  difficultyList: CommonListDropDown[] = [];
  typeList: CommonListDropDown[] = [];

  // Table data signals
  dataSource = signal<TableData[]>([]);
  totalItems = signal(0);
  pagination = signal({ pageNumber: 1, pageSize: tablePaginationConfig.PageSize });
  sort = signal({ sortColumn: '', sortDescending: false });

  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  //#endregion

  ngOnInit(): void {
    this.loadDropdowns();
    this.fetchQuestionPoolList();
  }

  // unsubscribe the subscribers
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#region load Dropdown
  loadDropdowns() {
    forkJoin({
      categories: this.dropdownService.getDropdownData(DropDownType.QuizCategory),
      difficulties: this.dropdownService.getDropdownData(DropDownType.QuestionDifficulty),
      types: this.dropdownService.getDropdownData(DropDownType.QuestionType),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ categories, difficulties, types }) => {
        this.categoryList = categories;
        this.difficultyList = difficulties;
        this.typeList = types;
      });
  }
  //#endregion

  getFilteredQuestions(): void {
    this.searchSubject.pipe(debounceTime(debounceTimeValue)).subscribe(() => {
      this.pagination.set({ ...this.pagination(), pageNumber: 1 });
      this.fetchQuestionPoolList();
    });
  }

  onSearchInputChange(value: string): void {
    this.getFilteredQuestions();
    this.searchSubject.next(value);
  }

  // Triggered on paginator change
  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pagination.set({ pageNumber: event.pageIndex + 1, pageSize: event.pageSize });
    this.fetchQuestionPoolList();
  }

  // Triggered on table sort change
  onSortChange(event: { active: string; direction: string }) {
    this.sort.set({
      sortColumn: event.active,
      sortDescending: event.direction === 'desc',
    });
    this.fetchQuestionPoolList();
  }

  // Triggered on role/status filter change
  onFilterChange() {
    this.pagination.set({ ...this.pagination(), pageNumber: 1 });
    this.fetchQuestionPoolList();
  }

  //#region fetch Questions
  // Fetch user list with filters, sort, pagination
  fetchQuestionPoolList() {
    const request: PaginationRequest = {
      ...this.pagination(),
      searchTerm: this.searchControl.value ?? '',
      sortColumn: this.sort().sortColumn,
      sortDescending: this.sort().sortDescending,
      filters: {},
    };

    // Apply filters if selected
    if (this.selectedCategory) request.filters!['quizCategoryId'] = Number(this.selectedCategory);
    if (this.selectedDifficulty)
      request.filters!['questionDifficultyId'] = Number(this.selectedDifficulty);
    if (this.selectedType) request.filters!['questionTypeId'] = Number(this.selectedType);

    this.questionPoolService
      .getQuestionPoolList(request)
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
          this.dataSource.set(res.data.records.map(questionPoolToTableData));
          this.totalItems.set(res.data.totalRecords);
        },
        error: (error) => {
          const message = error?.error?.message || error?.message || 'Unexpected error occurred';
          const status = error?.status || 'Unknown';
          this.snackbar.showError(message, `Error ${status}`);
        },
      });
  }
  //#endregion

  //#region handle Question action
  // handle all the question action delete, view, edit etc.
  handleQuestionAction(event: { action: string; row: TableData }): void {
    const question = event.row;
    switch (event.action) {
      case questionAction.DELETE:
        this.confirmAndDeleteQuestion(question['id'] as number);
        break;
      case questionAction.VIEW:
        this.openQuestionPreviewDialog(question['id'] as number);
        break;
      case questionAction.EDIT:
        this.openQuestionDialog('edit', question['id'] as number);
        break;
    }
  }
  //#endregion

  //#region delete dialog
  // delete question dialog
  confirmAndDeleteQuestion(questionId: number): void {
    this.openConfirmationDialog(deleteQuestionDialog, () => {
      this.questionPoolService
        .deleteQuestion(questionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.statusCode === 200) {
              this.snackbar.showSuccess(
                platformMessages.successTitle,
                platformMessages.deleteQuesSuccess,
              );

              // if at last page and only one item goes to previous page
              const currentData = this.dataSource();
              const currentPage = this.pagination().pageNumber;

              if (currentData.length === 1 && currentPage > 1) {
                this.pagination.set({ ...this.pagination(), pageNumber: currentPage - 1 });
              }
              this.fetchQuestionPoolList();
            } else {
              this.snackbar.showError(
                platformMessages.errorTitle,
                res.message || platformMessages.deleteQuesFailure,
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
    });
  }

  openConfirmationDialog(dialogData: ConfirmationDialogData, onConfirm: () => void): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      disableClose: true,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) onConfirm();
    });
  }
  //#endregion

  //#region create/edit dialog
  // dialog for manual question add/edit
  openQuestionDialog(mode: 'create' | 'edit' = 'create', question?: number) {
    const dialogRef = this.dialog.open(QuestionFormDialogComponent, {
      minWidth: '50vw',
      maxWidth: '100vw',
      maxHeight: '95vh',
      autoFocus: false,
      data: {
        mode,
        ...{ id: question },
      },
    });

    dialogRef.afterClosed().subscribe((changed) => {
      if (changed) {
        this.fetchQuestionPoolList();
      }
    });
  }
  //#endregion

  //#region preview dialog
  // question perview dialog
  openQuestionPreviewDialog(questionId: number) {
    this.dialog.open(QuestionPreviewDialogComponent, {
      width: '600px',
      maxHeight: '80vh',
      data: { id: questionId },
    });
  }
  //#endregion
}
