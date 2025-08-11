import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCategoriesManagementComponent } from './quiz-categories-management.component';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { QuizCategoryManagementService } from '../../../services/admin/quiz-category-management/quiz-category-management.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { categoryToCategoryTableData } from './components/quiz-category-table/quiz-category-table.mapper';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { QuizCategoryTableComponent } from './components/quiz-category-table/quiz-category-table.component';
import { platformMessages } from '../../../utils/constants';

// --- Mock Data ---
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
};

const snackbarMock = {
  showError: jest.fn(),
};

describe('QuizCategoriesManagementComponent (Jest)', () => {
  let component: QuizCategoriesManagementComponent;
  let fixture: ComponentFixture<QuizCategoriesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PageHeaderComponent,
        SearchInputComponent,
        FilledButtonComponent,
        QuizCategoryTableComponent,
      ],
      providers: [
        { provide: QuizCategoryManagementService, useValue: quizCategoryServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCategoriesManagementComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchQuizCategories on init', () => {
    const fetchSpy = jest.spyOn(component as any, 'fetchQuizCategories');
    fixture.detectChanges(); // triggers ngOnInit
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

  it('should call fetchQuizCategories and emit search term on onSearchInputChange', () => {
    const fetchSpy = jest.spyOn(component as any, 'fetchQuizCategories');
    const searchSpy = jest.spyOn(component['searchSubject$'], 'next');

    component.onSearchInputChange('science');

    expect(fetchSpy).toHaveBeenCalled();
    expect(searchSpy).toHaveBeenCalledWith('science');
  });

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
});
