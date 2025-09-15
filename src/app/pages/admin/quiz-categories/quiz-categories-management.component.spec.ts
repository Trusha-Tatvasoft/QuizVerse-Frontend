import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { QuizCategoriesManagementComponent } from './quiz-categories-management.component';
import { of, Subject, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { QuizCategoryManagementService } from '../../../services/admin/quiz-category-management/quiz-category-management.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { categoryToCategoryTableData } from './components/quiz-category-table/quiz-category-table.mapper';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { QuizCategoryTableComponent } from './components/quiz-category-table/quiz-category-table.component';
import { platformMessages, debounceTimeValue } from '../../../utils/constants';
import { MatDialog } from '@angular/material/dialog';
import { QuizCategoryAction, QuizCategoryStatus } from '../../../shared/enums/quiz-category.enum';
import { quizCategoryAction } from './configs/quiz-category-management.config';
import { TagComponent } from '../../../shared/components/tag/tag.component';

const mockResponse = {
  statusCode: 200,
  message: 'Success',
  result: true,
  data: {
    records: [
      {
        id: 1,
        categoryName: 'Math',
        description: 'Math quizzes',
        icon: 'math-icon',
        isActive: true,
        createdDate: '2025-08-01T00:00:00Z',
        quizCount: 5,
      },
    ],
    totalRecords: 1,
  },
};

const quizCategoryServiceMock = {
  getQuizCategoryList: jest.fn().mockReturnValue(of(mockResponse)),
  updateQuizCategoryByAction: jest
    .fn()
    .mockReturnValue(
      of({ statusCode: 200, result: true, message: 'Updated successfully', data: null }),
    ),
  getCategoryById: jest.fn().mockReturnValue(of({ id: 1, name: 'Test Category' })),
  previewCategory: jest.fn().mockReturnValue(of({ id: 2, name: 'Preview' })),
};

const snackbarMock = {
  showError: jest.fn(),
};

describe('QuizCategoriesManagementComponent (Jest)', () => {
  let component: QuizCategoriesManagementComponent;
  let fixture: ComponentFixture<QuizCategoriesManagementComponent>;
  let mockDialog: any;
  let mockSnackbar: jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    mockDialog = {
      open: jest.fn().mockReturnValue({
        componentInstance: { data: null, close: { subscribe: jest.fn() } },
        afterClosed: () => of(true),
        close: jest.fn(),
      }),
    };

    mockSnackbar = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        PageHeaderComponent,
        SearchInputComponent,
        FilledButtonComponent,
        QuizCategoryTableComponent,
        TagComponent,
      ],
      providers: [
        { provide: QuizCategoryManagementService, useValue: quizCategoryServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: MatDialog, useValue: mockDialog },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCategoriesManagementComponent);
    component = fixture.componentInstance;
    component.pagination.set({ pageNumber: 2, pageSize: 10 });
    component.dataSource.set([
      {
        id: 99,
        categoryName: 'Dummy',
        description: '',
        icon: null,
        isActive: true,
        createdDate: '',
        quizCount: 1,
      },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchQuizCategories on ngOnInit', () => {
    const fetchSpy = jest.spyOn(component as any, 'fetchQuizCategories');
    fixture.detectChanges();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should fetch quiz categories and populate dataSource', () => {
    quizCategoryServiceMock.getQuizCategoryList.mockReturnValue(of(mockResponse));

    component.fetchQuizCategories();

    expect(quizCategoryServiceMock.getQuizCategoryList).toHaveBeenCalled();

    const expectedData = mockResponse.data.records.map(categoryToCategoryTableData);
    expect(component.dataSource()).toEqual(expectedData);
    expect(component.totalItems()).toBe(1);
  });

  it('should show error if response is invalid', () => {
    const badResponse = {
      statusCode: 500,
      message: 'Server error',
      result: false,
      data: { records: [], totalRecords: 0 },
    };

    quizCategoryServiceMock.getQuizCategoryList.mockReturnValue(of(badResponse));

    component.fetchQuizCategories();

    expect(snackbarMock.showError).toHaveBeenCalledWith(
      'Server error',
      expect.stringContaining('Error'),
    );
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });

  it('should show error if request fails', () => {
    quizCategoryServiceMock.getQuizCategoryList.mockReturnValue(
      throwError(() => ({
        error: { message: 'Network down' },
      })),
    );

    component.fetchQuizCategories();

    expect(snackbarMock.showError).toHaveBeenCalledWith('Error', 'Network down');
  });

  it('should handle pagination change', () => {
    quizCategoryServiceMock.getQuizCategoryList.mockReturnValue(of(mockResponse));

    component.onPageChange({ pageIndex: 1, pageSize: 20 });

    expect(component.pagination().pageNumber).toBe(2);
    expect(component.pagination().pageSize).toBe(20);
  });

  it('should handle sort change', () => {
    quizCategoryServiceMock.getQuizCategoryList.mockReturnValue(of(mockResponse));

    component.onSortChange({ active: 'categoryName', direction: 'desc' });

    expect(component.sort().sortColumn).toBe('categoryName');
    expect(component.sort().sortDescending).toBe(true);
  });

  it('should debounce and call fetchQuizCategories after search input change', fakeAsync(() => {
    jest.spyOn(component as any, 'fetchQuizCategories');

    component.onSearchInputChange('science');
    tick(debounceTimeValue + 1);

    expect((component as any).fetchQuizCategories).toHaveBeenCalled();
  }));

  it('should show error snackbar when fetch fails with error object', () => {
    const errorResponse = {
      error: { message: 'Fetch failed' },
    };

    quizCategoryServiceMock.getQuizCategoryList.mockReturnValue(throwError(() => errorResponse));

    const snackbarSpy = jest.spyOn(snackbarMock, 'showError');

    component.fetchQuizCategories();

    expect(snackbarSpy).toHaveBeenCalledWith('Error', 'Fetch failed');
  });

  it('should use fallback PlatformMessages.errorMessage if res.message is missing', () => {
    const badResponse = {
      statusCode: 500,
      result: false,
      data: { records: [], totalRecords: 0 },
      message: null,
    };

    quizCategoryServiceMock.getQuizCategoryList.mockReturnValue(of(badResponse));

    component.fetchQuizCategories();

    expect(snackbarMock.showError).toHaveBeenCalledWith(
      platformMessages.errorMessage,
      expect.stringContaining('500'),
    );
  });

  it('should fallback to default error message if no error messages exist', () => {
    const errorResponse = {};

    quizCategoryServiceMock.getQuizCategoryList.mockReturnValue(throwError(() => errorResponse));

    component.fetchQuizCategories();

    expect(snackbarMock.showError).toHaveBeenCalledWith('Error', 'Unexpected error occurred');
  });

  it('should call loadQuizCategoryForEdit when action is EDIT', () => {
    const spy = jest.spyOn(component, 'loadQuizCategoryForEdit');
    component.handleCategoryAction({ action: quizCategoryAction.EDIT, row: { id: 1 } as any });
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should call loadQuizPreview when action is PREVIEW', () => {
    const spy = jest.spyOn(component, 'loadQuizPreview');
    component.handleCategoryAction({ action: quizCategoryAction.PREVIEW, row: { id: 2 } as any });
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('should call openConfirmationDialog for DELETE', () => {
    const spy = jest.spyOn(component, 'openConfirmationDialog');
    component.handleCategoryAction({ action: quizCategoryAction.DELETE, row: { id: 3 } as any });
    expect(spy).toHaveBeenCalled();
  });

  it('should call openConfirmationDialog for INACTIVATE', () => {
    const spy = jest.spyOn(component, 'openConfirmationDialog');
    component.handleCategoryAction({
      action: quizCategoryAction.INACTIVATE,
      row: { id: 4 } as any,
    });
    expect(spy).toHaveBeenCalled();
  });

  it('should call openConfirmationDialog for ACTIVATE', () => {
    const spy = jest.spyOn(component, 'openConfirmationDialog');
    component.handleCategoryAction({ action: quizCategoryAction.ACTIVATE, row: { id: 5 } as any });
    expect(spy).toHaveBeenCalled();
  });

  // loadQuizCategoryForEdit
  it('should open dialog when service returns data', () => {
    quizCategoryServiceMock.getCategoryById.mockReturnValue(
      of({ statusCode: 200, data: { id: 1 } }),
    );
    const spy = jest.spyOn(component, 'openAddOrEditCategory');

    component.loadQuizCategoryForEdit(1);

    expect(quizCategoryServiceMock.getCategoryById).toHaveBeenCalledWith(1);
    expect(spy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should show error on service error', fakeAsync(() => {
    quizCategoryServiceMock.getCategoryById.mockReturnValue(
      throwError(() => ({ error: { message: 'Server error' } })),
    );
    (component as any).snackbar = mockSnackbar;
    component.loadQuizCategoryForEdit(1);
    tick();
    expect(mockSnackbar.showError).toHaveBeenCalledWith(expect.anything(), 'Server error');
  }));

  it('should open preview dialog when data found', () => {
    const spy = jest.spyOn(component, 'openPreviewDialog');
    quizCategoryServiceMock.getCategoryById.mockReturnValue(
      of({ statusCode: 200, data: { id: 2 } }),
    );

    component.loadQuizPreview(2);

    expect(spy).toHaveBeenCalledWith({ id: 2 });
  });

  it('should show error when no data returned', fakeAsync(() => {
    quizCategoryServiceMock.getCategoryById.mockReturnValue(
      of({ statusCode: 404, message: 'Not found' }),
    );
    (component as any).destroy$ = new Subject<void>();
    (component as any).snackbar = mockSnackbar;
    component.loadQuizCategoryForEdit(2);

    tick();

    expect(mockSnackbar.showError).toHaveBeenCalled();
  }));

  it('should show error on service failure', fakeAsync(() => {
    quizCategoryServiceMock.getCategoryById.mockReturnValue(
      throwError(() => ({ error: { message: 'Network error' } })),
    );

    (component as any).destroy$ = new Subject<void>();
    (component as any).snackbar = mockSnackbar;

    component.loadQuizCategoryForEdit(1);
    tick();

    expect(mockSnackbar.showError).toHaveBeenCalledWith('Error!', 'Network error');
  }));

  // openConfirmationDialog
  it('should call onConfirm if user confirms', () => {
    const confirmSpy = jest.fn();
    mockDialog.open = jest.fn().mockReturnValue({
      afterClosed: () => of(true),
    });

    component.openConfirmationDialog({ title: 'Confirm' } as any, confirmSpy);

    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should not call onConfirm if user cancels', () => {
    const confirmSpy = jest.fn();
    mockDialog.open = jest.fn().mockReturnValue({
      afterClosed: () => of(false),
    });

    component.openConfirmationDialog({ title: 'Confirm' } as any, confirmSpy);

    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('should show error when response is invalid', () => {
    quizCategoryServiceMock.updateQuizCategoryByAction.mockReturnValue(
      of({
        statusCode: 400,
        result: false,
        message: 'Bad request',
      }),
    );

    component.updateQuizCategoryStatus(
      1,
      QuizCategoryAction.UpdateStatus,
      QuizCategoryStatus.Active,
    );

    expect(snackbarMock.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'Bad request');
  });

  it('should decrement page if last item is removed and not on first page', () => {
    // simulate only one item on page 2
    component.dataSource.set([
      {
        id: 101,
        categoryName: 'LastOne',
        description: '',
        icon: null,
        isActive: true,
        createdDate: '',
        quizCount: 1,
      },
    ]);
    component.pagination.set({ pageNumber: 2, pageSize: 10 });

    quizCategoryServiceMock.updateQuizCategoryByAction.mockReturnValue(
      of({
        statusCode: 200,
        result: true,
        message: 'Deleted',
      }),
    );

    component.updateQuizCategoryStatus(101, QuizCategoryAction.Delete);

    expect(component.pagination().pageNumber).toBe(1);
  });

  it('should show error when service throws exception', () => {
    quizCategoryServiceMock.updateQuizCategoryByAction.mockReturnValue(
      throwError(() => ({ error: { message: 'Server exploded' } })),
    );

    component.updateQuizCategoryStatus(
      1,
      QuizCategoryAction.UpdateStatus,
      QuizCategoryStatus.Active,
    );

    expect(snackbarMock.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      'Server exploded',
    );
  });

  // ngOnDestroy
  it('should complete destroy$', () => {
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(completeSpy).toHaveBeenCalled();
  });
});
