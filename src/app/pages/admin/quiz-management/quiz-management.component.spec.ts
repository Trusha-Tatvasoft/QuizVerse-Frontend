import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { QuizManagementComponent } from './quiz-management.component';
import { QuizManagementService } from '../../../services/admin/quiz-management/quiz-management.service';
import { QuizManagementSummary } from './interfaces/quiz-management-summary.interface';
import { of, throwError } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { DropdownService } from '../../../shared/service/dropdown/dropdown.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { DropDownType } from '../../../shared/enums/dropdown-types.enum';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { QuizTableComponent } from './components/quiz-table/quiz-table.component';
import { MatSelectModule } from '@angular/material/select';
import { debounceTimeValue, platformMessages, quizActions } from '../../../utils/constants';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Navigations } from '../../../shared/enums/navigation';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QuizCreationService } from '../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { QuizPreviewComponent } from './components/quiz-preview/quiz-preview.component';
import { QuizResponse } from '../../../shared/interfaces/quiz-creation.interface';

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
  deleteQuiz: jest.fn(),
};

const dropdownServiceMock = {
  getDropdownData: jest.fn(),
};

const snackbarMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};

const routerMock = {
  navigate: jest.fn(),
};

const dialogMock = {
  open: jest.fn(),
};

const quizCreationServiceMock = {
  getQuiz: jest.fn(),
  getDropDownData: jest.fn(),
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
        HttpClientTestingModule,
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
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: MatDialog,
          useValue: dialogMock,
        },
        {
          provide: QuizCreationService,
          useValue: quizCreationServiceMock,
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

  describe('navigateToQuizCreation', () => {
    it('should navigate to quiz creation page', () => {
      component.navigateToQuizCreation();
      expect(routerMock.navigate).toHaveBeenCalledWith([
        `/${Navigations.Admin}/${Navigations.Quizzes}/${Navigations.QuizCreation}`,
      ]);
    });
  });

  describe('handleQuizAction', () => {
    it('should navigate with encoded id for EDIT action', () => {
      const quiz = { id: 123 };
      component.handleQuizAction({ action: quizActions.EDIT, row: quiz as any });
      const encodedId = btoa('123');
      expect(routerMock.navigate).toHaveBeenCalledWith([
        `/${Navigations.Admin}/${Navigations.Quizzes}/${Navigations.QuizCreation}`,
        encodedId,
      ]);
    });

    it('should open confirmation dialog and delete quiz on DELETE action (confirmed)', () => {
      const quiz = { id: 99 };
      const afterClosed$ = of(true);
      dialogMock.open.mockReturnValue({ afterClosed: () => afterClosed$ });
      const deleteSpy = jest.spyOn(component, 'deleteQuiz').mockImplementation();

      component.handleQuizAction({ action: quizActions.DELETE, row: quiz as any });

      expect(dialogMock.open).toHaveBeenCalledWith(ConfirmationDialogComponent, expect.any(Object));
      expect(deleteSpy).toHaveBeenCalledWith(99);
    });

    it('should not call deleteQuestion if dialog is cancelled', () => {
      const quiz = { id: 55 };
      dialogMock.open.mockReturnValue({ afterClosed: () => of(false) });
      const deleteSpy = jest.spyOn(component, 'deleteQuiz').mockImplementation();

      component.handleQuizAction({ action: quizActions.DELETE, row: quiz as any });

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    // test cases for quiz visibility
    // it('should handle VISIBILITY action gracefully', () => {
    // });
  });

  describe('deleteQuestion', () => {
    const quizId = 5;

    it('should show success snackbar and refetch quizzes on statusCode=200', () => {
      const fetchSpy = jest.spyOn(component, 'fetchQuizzes').mockImplementation();
      jest.spyOn(component, 'dataSource').mockReturnValue([{}]);
      jest.spyOn(component, 'pagination').mockReturnValue({
        pageNumber: 1,
        pageSize: 5,
      });

      quizManagementService.deleteQuiz.mockReturnValue(of({ statusCode: 200 }));

      component.deleteQuiz(quizId);

      expect(snackbarMock.showSuccess).toHaveBeenCalledWith(
        'Success',
        platformMessages.deleteQuizSuccess,
      );
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('should adjust pagination when last item on non-first page is deleted', () => {
      const fetchSpy = jest.spyOn(component, 'fetchQuizzes').mockImplementation();
      jest.spyOn(component, 'dataSource').mockReturnValue([{}]); // only one item left

      component.pagination.set({ pageNumber: 2, pageSize: 5 });

      const paginationSetSpy = jest.spyOn(component.pagination, 'set');

      quizManagementService.deleteQuiz.mockReturnValue(of({ statusCode: 200 }));

      component.deleteQuiz(quizId);

      expect(paginationSetSpy).toHaveBeenCalledWith(
        expect.objectContaining({ pageNumber: 1, pageSize: 5 }),
      );
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('should show error snackbar when statusCode !== 200', () => {
      quizManagementService.deleteQuiz.mockReturnValue(of({ statusCode: 400, message: 'fail' }));

      component.deleteQuiz(quizId);

      expect(snackbarMock.showError).toHaveBeenCalledWith('Error', 'fail');
    });

    it('should show error snackbar on API error', () => {
      quizManagementService.deleteQuiz.mockReturnValue(
        throwError(() => ({ error: { message: 'network error' } })),
      );

      component.deleteQuiz(quizId);

      expect(snackbarMock.showError).toHaveBeenCalledWith('Error', 'network error');
    });
  });

  describe('mapQuestions', () => {
    it('should map QuestionResponseDto to QuestionsList correctly', () => {
      const mockQuestions = [
        {
          id: 1,
          categoryId: 2,
          queDifficultyId: 3,
          queText: 'Sample Question',
          queTypeId: 4,
          queOptionsAns: [{ id: 10, questionId: 1, key: 'A', value: 'Option A' }],
        },
      ];

      const typeMap = { 4: 'Multiple Choice' };
      const result = (component as any).mapQuestions(mockQuestions, typeMap);

      expect(result[0].queTypeName).toBe('Multiple Choice');
      expect(result[0].queOptionsAns![0].value).toBe('Option A');
    });
  });

  describe('getLookupMap', () => {
    it('should return a map of id to name', (done) => {
      quizCreationServiceMock.getDropDownData.mockReturnValue(
        of({ data: [{ id: 1, name: 'Math' }] }),
      );

      (component as any).getLookupMap(DropDownType.QuizCategory).subscribe((map: any) => {
        expect(map[1]).toBe('Math');
        done();
      });
    });
  });

  describe('previewQuiz', () => {
    it('should call openPreview on success', () => {
      const quizData = { id: 1, questions: [], name: 'Q1' };
      quizCreationServiceMock.getQuiz.mockReturnValue(of({ data: quizData }));
      const spy = jest.spyOn(component as any, 'openPreview').mockImplementation();

      component.previewQuiz(1);

      expect(spy).toHaveBeenCalledWith(quizData);
    });

    it('should call snackbar on error', () => {
      quizCreationServiceMock.getQuiz.mockReturnValue(throwError(() => 'error'));
      component.previewQuiz(1);
      expect(snackbarMock.showError).toHaveBeenCalledWith('error');
    });
  });

  describe('openPreview', () => {
    it('should open dialog with mapped data on success', () => {
      quizCreationServiceMock.getDropDownData.mockImplementation((type: DropDownType) => {
        if (type === DropDownType.QuestionType) return of({ data: [{ id: 1, name: 'MCQ' }] });
        if (type === DropDownType.QuizCategory) return of({ data: [{ id: 2, name: 'Science' }] });
        return of({ data: [] });
      });

      const quizResponse = {
        name: 'Quiz 1',
        description: 'Desc',
        categoryId: 2,
        totalTime: 30,
        totalQuestion: 5,
        questions: [
          {
            id: 1,
            categoryId: 2,
            queDifficultyId: 1,
            queText: 'Q1',
            queTypeId: 1,
            queOptionsAns: [],
          },
        ],
      };

      component.openPreview(quizResponse as unknown as QuizResponse);

      expect(dialogMock.open).toHaveBeenCalledWith(QuizPreviewComponent, expect.any(Object));
    });

    it('should call snackbar on error', () => {
      quizCreationServiceMock.getDropDownData.mockReturnValue(throwError(() => 'network error'));

      component.openPreview({} as any);

      expect(snackbarMock.showError).toHaveBeenCalledWith('network error');
    });
  });

  describe('handleQuizAction VISIBILITY', () => {
    it('should call previewQuiz with quiz id', () => {
      const spy = jest.spyOn(component, 'previewQuiz').mockImplementation();
      component.handleQuizAction({ action: quizActions.VISIBILITY, row: { id: 42 } as any });
      expect(spy).toHaveBeenCalledWith(42);
    });
  });
});
