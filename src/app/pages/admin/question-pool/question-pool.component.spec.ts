import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuestionPoolComponent } from './question-pool.component';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { QuestionPoolService } from '../../../services/admin/question-pool/question-pool.service';
import { DropdownService } from '../../../shared/service/dropdown/dropdown.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { questionPoolToTableData } from './components/question-pool-listing/question-pool-listing.mapper';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { QuestionPoolListingComponent } from './components/question-pool-listing/question-pool-listing.component';
import { MatSelectModule } from '@angular/material/select';
import { debounceTimeValue, platformMessages, questionAction } from '../../../utils/constants';
import { DropDownType } from '../../../shared/enums/dropdown-types.enum';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { QuestionPreviewDialogComponent } from './components/question-preview-dialog/question-preview-dialog.component';

const mockDropdownData = {
  categories: [
    { id: 1, name: 'Math' },
    { id: 2, name: 'Science' },
  ],
  difficulties: [
    { id: 1, name: 'Easy' },
    { id: 2, name: 'Hard' },
  ],
  types: [
    { id: 1, name: 'Multiple Choice' },
    { id: 2, name: 'True/False' },
  ],
};

const mockResponse = {
  statusCode: 200,
  result: true,
  message: 'Success',
  data: {
    records: [
      {
        id: 101,
        question: 'What is 2+2?',
        quizCategoryId: 1,
        questionDifficultyId: 1,
        questionTypeId: 1,
        createdDate: '2025-08-01T00:00:00Z',
        categoryId: 1,
        categoryName: 'Math',
        queDifficultyId: 1,
        queDifficultyName: 'Easy',
        questionTypeName: 'Multiple Choice',
        correctAnswer: '4',
        queText: 'What is 2+2?',
        queTypeId: 1,
        queTypeName: 'Multiple Choice',
        queOptionsAns: [],
      },
    ],
    totalRecords: 1,
  },
};

const questionPoolServiceMock = {
  getQuestionPoolList: jest.fn().mockReturnValue(of(mockResponse)),
  deleteQuestion: jest.fn().mockReturnValue(of({ statusCode: 200 })),
};

const dropdownServiceMock = {
  getDropdownData: jest.fn(),
};

const snackbarMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};

const matDialogMock = {
  open: jest.fn(),
};

describe('QuestionPoolComponent (Jest)', () => {
  let component: QuestionPoolComponent;
  let fixture: ComponentFixture<QuestionPoolComponent>;
  let matDialog: MatDialog;

  beforeEach(async () => {
    dropdownServiceMock.getDropdownData.mockImplementation((type: DropDownType) => {
      switch (type) {
        case DropDownType.QuizCategory:
          return of(mockDropdownData.categories);
        case DropDownType.QuestionDifficulty:
          return of(mockDropdownData.difficulties);
        case DropDownType.QuestionType:
          return of(mockDropdownData.types);
        default:
          return of([]);
      }
    });

    await TestBed.configureTestingModule({
      imports: [
        PageHeaderComponent,
        SearchInputComponent,
        FilledButtonComponent,
        QuestionPoolListingComponent,
        MatSelectModule,
        QuestionPoolComponent,
      ],
      providers: [
        { provide: QuestionPoolService, useValue: questionPoolServiceMock },
        { provide: DropdownService, useValue: dropdownServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: MatDialog, useValue: matDialogMock },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionPoolComponent);
    component = fixture.componentInstance;

    matDialog = TestBed.inject(MatDialog);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load dropdown data on loadDropdowns', fakeAsync(() => {
    component.loadDropdowns();
    tick();
    expect(dropdownServiceMock.getDropdownData).toHaveBeenCalledTimes(3);
    expect(component.categoryList).toEqual(mockDropdownData.categories);
    expect(component.difficultyList).toEqual(mockDropdownData.difficulties);
    expect(component.typeList).toEqual(mockDropdownData.types);
  }));

  it('should fetch question pool list successfully and update dataSource and totalItems', () => {
    questionPoolServiceMock.getQuestionPoolList.mockReturnValue(of(mockResponse));
    component.fetchQuestionPoolList();
    expect(questionPoolServiceMock.getQuestionPoolList).toHaveBeenCalled();
    const expectedData = mockResponse.data.records.map(questionPoolToTableData);
    expect(component.dataSource()).toEqual(expectedData);
    expect(component.totalItems()).toBe(mockResponse.data.totalRecords);
  });

  it('should show error snackbar and reset data when response is invalid', () => {
    const badResponse = {
      statusCode: 500,
      result: false,
      message: 'Server error',
      data: { records: [], totalRecords: 0 },
    };
    questionPoolServiceMock.getQuestionPoolList.mockReturnValue(of(badResponse));
    component.fetchQuestionPoolList();
    expect(snackbarMock.showError).toHaveBeenCalledWith(
      'Server error',
      expect.stringContaining('500'),
    );
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });

  it('should show error snackbar with fallback message if res.message missing', () => {
    const badResponse = {
      statusCode: 500,
      result: false,
      message: null,
      data: { records: [], totalRecords: 0 },
    };
    questionPoolServiceMock.getQuestionPoolList.mockReturnValue(of(badResponse));
    component.fetchQuestionPoolList();
    expect(snackbarMock.showError).toHaveBeenCalledWith(
      platformMessages.errorMessage,
      expect.stringContaining('500'),
    );
  });

  it('should show error snackbar on fetch error with error message', () => {
    const errorResponse = { error: { message: 'Network down' }, status: 0 };
    questionPoolServiceMock.getQuestionPoolList.mockReturnValue(throwError(() => errorResponse));
    component.fetchQuestionPoolList();
    expect(snackbarMock.showError).toHaveBeenCalledWith('Network down', 'Error Unknown');
  });

  it('should fallback to default error message if error response missing message', () => {
    const errorResponse = {};
    questionPoolServiceMock.getQuestionPoolList.mockReturnValue(throwError(() => errorResponse));
    component.fetchQuestionPoolList();
    expect(snackbarMock.showError).toHaveBeenCalledWith(
      'Unexpected error occurred',
      'Error Unknown',
    );
  });

  it('should update pagination and fetch on onPageChange', () => {
    questionPoolServiceMock.getQuestionPoolList.mockReturnValue(of(mockResponse));
    component.onPageChange({ pageIndex: 1, pageSize: 20 });
    expect(component.pagination().pageNumber).toBe(2);
    expect(component.pagination().pageSize).toBe(20);
  });

  it('should update sort and fetch on onSortChange', () => {
    questionPoolServiceMock.getQuestionPoolList.mockReturnValue(of(mockResponse));
    component.onSortChange({ active: 'question', direction: 'desc' });
    expect(component.sort().sortColumn).toBe('question');
    expect(component.sort().sortDescending).toBe(true);
  });

  it('should reset page number and fetch on onFilterChange', () => {
    questionPoolServiceMock.getQuestionPoolList.mockReturnValue(of(mockResponse));
    component.pagination.set({ pageNumber: 5, pageSize: 10 });
    component.onFilterChange();
    expect(component.pagination().pageNumber).toBe(1);
  });

  it('should debounce search input and call fetch after debounce time', fakeAsync(() => {
    jest.spyOn(component, 'fetchQuestionPoolList');
    component.onSearchInputChange('test');
    tick(debounceTimeValue + 1);
    expect(component.fetchQuestionPoolList).toHaveBeenCalled();
  }));

  it('should apply selected filters to the request in fetchQuestionPoolList', () => {
    component.selectedCategory = 1;
    component.selectedDifficulty = 2;
    component.selectedType = 3;

    questionPoolServiceMock.getQuestionPoolList.mockImplementation((req) => {
      expect(req.filters).toEqual({
        quizCategoryId: 1,
        questionDifficultyId: 2,
        questionTypeId: 3,
      });
      return of(mockResponse);
    });

    component.fetchQuestionPoolList();
    expect(questionPoolServiceMock.getQuestionPoolList).toHaveBeenCalled();
  });

  it('ngOnInit should load dropdowns and fetch question pool list with filters', fakeAsync(() => {
    component.selectedCategory = 1;
    component.selectedDifficulty = 2;
    component.selectedType = 3;

    questionPoolServiceMock.getQuestionPoolList.mockImplementation((req) => {
      expect(req.filters).toEqual({
        quizCategoryId: 1,
        questionDifficultyId: 2,
        questionTypeId: 3,
      });
      return of(mockResponse);
    });

    component.ngOnInit();
    tick();

    expect(dropdownServiceMock.getDropdownData).toHaveBeenCalledTimes(3);
    expect(questionPoolServiceMock.getQuestionPoolList).toHaveBeenCalled();
  }));

  describe('handleQuestionAction', () => {
    it('should call confirmAndDeleteQuestion for DELETE action', () => {
      jest.spyOn(component, 'confirmAndDeleteQuestion');

      matDialogMock.open.mockReturnValue({
        afterClosed: () => of(true),
      });

      const question = { id: 123 } as TableData;
      component.handleQuestionAction({ action: questionAction.DELETE, row: question });

      expect(component.confirmAndDeleteQuestion).toHaveBeenCalledWith(123);
    });

    it('should call openQuestionPreviewDialog for VIEW action', () => {
      const spy = jest.spyOn(component, 'openQuestionPreviewDialog');
      const question = { id: 456 } as TableData;
      component.handleQuestionAction({ action: questionAction.VIEW, row: question });
      expect(spy).toHaveBeenCalledWith(456);
    });
  });

  describe('confirmAndDeleteQuestion', () => {
    it('should open confirmation dialog and delete question on confirm success', fakeAsync(() => {
      const openSpy = jest.spyOn(matDialogMock, 'open').mockReturnValue({
        afterClosed: () => of(true),
      } as any);

      questionPoolServiceMock.deleteQuestion.mockReturnValue(of({ statusCode: 200 }));

      jest.spyOn(component, 'fetchQuestionPoolList').mockImplementation(jest.fn());

      component.dataSource.set([{ id: 101 } as TableData]);
      component.pagination.set({ pageNumber: 2, pageSize: 10 });

      component.confirmAndDeleteQuestion(101);

      tick(); // <-- wait for async inside to complete

      expect(openSpy).toHaveBeenCalledWith(ConfirmationDialogComponent, expect.any(Object));
      expect(questionPoolServiceMock.deleteQuestion).toHaveBeenCalledWith(101);
      expect(snackbarMock.showSuccess).toHaveBeenCalledWith(
        'Success',
        platformMessages.deleteQuesSuccess,
      );
      expect(component.pagination().pageNumber).toBe(1);
    }));

    it('should show error snackbar if delete returns non-200 status', fakeAsync(() => {
      const openSpy = jest.spyOn(matDialogMock, 'open').mockReturnValue({
        afterClosed: () => of(true),
      } as any);

      questionPoolServiceMock.deleteQuestion.mockReturnValue(
        of({ statusCode: 500, message: 'Delete failed' }),
      );

      component.confirmAndDeleteQuestion(101);

      tick();

      expect(openSpy).toHaveBeenCalled();
      expect(questionPoolServiceMock.deleteQuestion).toHaveBeenCalled();
      expect(snackbarMock.showError).toHaveBeenCalledWith('Error', 'Delete failed');
    }));

    it('should show error snackbar on delete error', fakeAsync(() => {
      const openSpy = jest.spyOn(matDialogMock, 'open').mockReturnValue({
        afterClosed: () => of(true),
      } as any);

      questionPoolServiceMock.deleteQuestion.mockReturnValue(
        throwError(() => ({ error: { message: 'Network error' } })),
      );

      component.confirmAndDeleteQuestion(101);

      tick();

      expect(openSpy).toHaveBeenCalled();
      expect(questionPoolServiceMock.deleteQuestion).toHaveBeenCalled();
      expect(snackbarMock.showError).toHaveBeenCalledWith('Error', 'Network error');
    }));

    it('should not call delete if dialog is cancelled', fakeAsync(() => {
      const openSpy = jest.spyOn(matDialogMock, 'open').mockReturnValue({
        afterClosed: () => of(false),
      } as any);

      component.confirmAndDeleteQuestion(101);

      tick();

      expect(openSpy).toHaveBeenCalled();
      expect(questionPoolServiceMock.deleteQuestion).not.toHaveBeenCalled();
      expect(snackbarMock.showError).not.toHaveBeenCalled();
      expect(snackbarMock.showSuccess).not.toHaveBeenCalled();
    }));
  });

  describe('openQuestionPreviewDialog', () => {
    it('should open question preview dialog with correct config', () => {
      component.openQuestionPreviewDialog(123);

      expect(matDialogMock.open).toHaveBeenCalledWith(QuestionPreviewDialogComponent, {
        width: '600px',
        maxHeight: '80vh',
        data: { id: 123 },
      });
    });
  });
});
