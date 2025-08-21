import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { QuizManagementComponent } from './quiz-management.component';
import { QuizManagementService } from '../../../services/admin/quiz-management/quiz-management.service';
import { QuizManagementSummary } from './interfaces/quiz-management-summary.interface';
import { of, throwError } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { DropdownService } from '../../../shared/service/dropdown/dropdown.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { DropDownType } from '../../../shared/enums/dropdown-types.enum';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { QuizTableComponent } from './components/quiz-table/quiz-table.component';
import { MatSelectModule } from '@angular/material/select';
import { debounceTimeValue } from '../../../utils/constants';
import { By } from '@angular/platform-browser';

const mockSummary: QuizManagementSummary = {
  totalQuiz: 10,
  totalParticipants: 20,
  activeQuiz: 8,
  totalQuestions: 15,
};

const successResponse: ApiResponse<QuizManagementSummary> = {
  result: true,
  statusCode: 200,
  message: 'ok',
  data: mockSummary,
};

const failResponse: ApiResponse<QuizManagementSummary> = {
  result: false,
  statusCode: 400,
  message: 'Failed to load stats',
  data: {} as QuizManagementSummary,
};

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

const mockQuizResponse = {
  statusCode: 200,
  result: true,
  message: 'Success',
  data: {
    records: [
      {
        id: 9,
        quizTitle: 'Gk Quizes',
        categoryName: 'Technology',
        quizDifficultyLevel: 'Medium',
        totalQuestion: 10,
        noOfPersonAttempted: 0,
        status: 1,
        createdDate: '2025-08-11T18:12:11.32978',
      },
    ],
    totalRecords: 1,
  },
};

const quizManagementService = {
  getQuizManagementStats: jest.fn(),
  getQuizzes: jest.fn(),
};

const dropdownServiceMock = {
  getDropdownData: jest.fn(),
};

const snackbarMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};

describe('QuizManagementComponent', () => {
  let component: QuizManagementComponent;
  let fixture: ComponentFixture<QuizManagementComponent>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PageHeaderComponent,
        SearchInputComponent,
        FilledButtonComponent,
        QuizManagementComponent,
        QuizTableComponent,
        MatSelectModule,
      ],
      providers: [
        {
          provide: QuizManagementService,
          useValue: quizManagementService,
        },
        {
          provide: DropdownService,
          useValue: dropdownServiceMock,
        },
        {
          provide: SnackbarService,
          useValue: snackbarMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizManagementComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ngOnInit', () => {
    it('should call loadDropdowns, getQuizManagementStats and fetchQuizzes', () => {
      const loadDropdownsSpy = jest.spyOn(component, 'loadDropdowns').mockImplementation();
      const statsSpy = jest
        .spyOn<any, any>(component as any, 'getQuizManagementStats')
        .mockImplementation();
      const fetchSpy = jest.spyOn(component, 'fetchQuizzes').mockImplementation();

      component.ngOnInit();

      expect(loadDropdownsSpy).toHaveBeenCalled();
      expect(statsSpy).toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      const completeSpy = jest.spyOn<any, any>(component['destroy'], 'complete');
      component.ngOnDestroy();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('loadDropdowns', () => {
    it('should load categories and difficulties', () => {
      dropdownServiceMock.getDropdownData.mockImplementation((type: DropDownType) => {
        if (type === DropDownType.QuizCategory) return of(mockDropdownData.categories);
        if (type === DropDownType.QuizDifficulty) return of(mockDropdownData.difficulties);
        return of([]);
      });

      component.loadDropdowns();

      expect(component.categoryList).toEqual(mockDropdownData.categories);
      expect(component.difficultyList).toEqual(mockDropdownData.difficulties);
    });
  });

  describe('getQuizManagementStats', () => {
    it('should set quizStatsConfigs on success', () => {
      quizManagementService.getQuizManagementStats.mockReturnValue(of(successResponse));
      (component as any).getQuizManagementStats();
      expect(component.quizStatsConfigs.length).toBeGreaterThan(0);
    });

    it('should clear quizStatsConfigs on error', () => {
      quizManagementService.getQuizManagementStats.mockReturnValue(
        throwError(() => new Error('Error')),
      );
      (component as any).getQuizManagementStats();
      expect(component.quizStatsConfigs).toEqual([]);
    });

    it('should clear quizStatsConfigs when result is false', () => {
      quizManagementService.getQuizManagementStats.mockReturnValue(of(failResponse));
      (component as any).getQuizManagementStats();
      expect(component.quizStatsConfigs).toEqual([]);
    });
  });

  describe('fetchQuizzes', () => {
    it('should set dataSource and totalItems on success', () => {
      quizManagementService.getQuizzes.mockReturnValue(of(mockQuizResponse));

      component.fetchQuizzes();

      expect(component.dataSource().length).toBe(1);
      expect(component.totalItems()).toBe(1);
    });

    it('should call snackbar on failure response', () => {
      quizManagementService.getQuizzes.mockReturnValue(
        of({ ...mockQuizResponse, result: false, statusCode: 400 }),
      );

      component.fetchQuizzes();

      expect(snackbarMock.showError).toHaveBeenCalled();
      expect(component.dataSource()).toEqual([]);
      expect(component.totalItems()).toBe(0);
    });

    it('should call snackbar on error', () => {
      quizManagementService.getQuizzes.mockReturnValue(
        throwError(() => ({ status: 500, message: 'Server Error' })),
      );

      component.fetchQuizzes();

      expect(snackbarMock.showError).toHaveBeenCalledWith('Server Error', 'Error 500');
    });
  });

  describe('user actions', () => {
    it('should apply filters and fetch quizzes on filter change', () => {
      const spy = jest.spyOn(component as any, 'fetchQuizzes');
      component.selectedCategory = 1;
      component.selectedDifficulty = 2;
      component.selectedStatus = 2;
      component.onFilterChange();
      expect(component.pagination().pageNumber).toBe(1);
      expect(spy).toHaveBeenCalled();
    });

    it('should update sort and fetch quizzes on onSortChange', () => {
      const spy = jest.spyOn(component, 'fetchQuizzes');
      component.onSortChange({ active: 'quiz_title', direction: 'desc' });
      expect(component.sort().sortColumn).toBe('quiz_title');
      expect(component.sort().sortDescending).toBe(true);
      expect(spy).toHaveBeenCalled();
    });

    it('should update pagination and fetch quizzes on onPageChange', () => {
      const spy = jest.spyOn(component, 'fetchQuizzes');
      component.onPageChange({ pageIndex: 1, pageSize: 10 });
      expect(component.pagination().pageNumber).toBe(2);
      expect(spy).toHaveBeenCalled();
    });

    it('should debounce and fetch quizzes on search input change', fakeAsync(() => {
      const spy = jest.spyOn(component as any, 'fetchQuizzes');
      component.onSearchInputChange('Maths');
      expect(spy).not.toHaveBeenCalled();
      tick(debounceTimeValue);
      expect(spy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('Template rendering', () => {
    it('should render child components', () => {
      expect(fixture.debugElement.query(By.directive(PageHeaderComponent))).toBeTruthy();
      expect(fixture.debugElement.query(By.directive(QuizTableComponent))).toBeTruthy();
      expect(fixture.debugElement.query(By.directive(SearchInputComponent))).toBeTruthy();
      expect(fixture.debugElement.query(By.directive(FilledButtonComponent))).toBeTruthy();
    });

    it('should generate correct filter lists for statuses', () => {
      expect(component.quizStatus.length).toBeGreaterThan(0);
    });
  });
});
