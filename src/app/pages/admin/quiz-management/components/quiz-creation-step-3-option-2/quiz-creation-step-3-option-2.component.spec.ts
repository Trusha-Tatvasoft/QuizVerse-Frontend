import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCreationStep3Option2Component } from './quiz-creation-step-3-option-2.component';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { of, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { QuestionPoolList } from '../../../../../shared/interfaces/quiz-creation.interface';
import { PaginatedDataResponse } from '../../../../../shared/interfaces/paginated-data-response.interface';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';

describe('QuizCreationStep3Option2Component', () => {
  let component: QuizCreationStep3Option2Component;
  let fixture: ComponentFixture<QuizCreationStep3Option2Component>;
  let quizService: jest.Mocked<QuizCreationService>;
  let snackbar: jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    const quizServiceMock: Partial<jest.Mocked<QuizCreationService>> = {
      getQuestions: jest.fn().mockReturnValue(
        of({
          result: true,
          statusCode: 200,
          message: 'ok',
          data: { records: [], totalRecords: 0 },
        }),
      ),
      getQuestionsFromCsv: jest.fn().mockReturnValue(of({ data: [] })),
      getQuestionsFromExcel: jest.fn().mockReturnValue(of({ data: [] })),
    };

    const snackbarMock: Partial<jest.Mocked<SnackbarService>> = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [QuizCreationStep3Option2Component],
      providers: [
        { provide: QuizCreationService, useValue: quizServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep3Option2Component);
    component = fixture.componentInstance;
    quizService = TestBed.inject(QuizCreationService) as jest.Mocked<QuizCreationService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;

    // Provide required @Input()
    component.quizStep1Data = {
      quizCategory: 1,
      difficultyDistribution: [{ key: 'Easy', value: 2 }],
    } as any;

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnDestroy', () => {
    const destroySpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should emit closeOption', () => {
    const spy = jest.spyOn(component.closeQuestionAdditionOption, 'emit');
    component.closeOption();
    expect(spy).toHaveBeenCalled();
  });

  describe('fetchQuestions', () => {
    it('should fetch questions and update dataSource', () => {
      const mockResponse: ApiResponse<PaginatedDataResponse<QuestionPoolList>> = {
        result: true,
        statusCode: 200,
        message: 'ok',
        data: {
          records: [
            {
              id: 1,
              categoryId: 1,
              categoryName: 'Math',
              queDifficultyId: 1,
              queDifficultyName: 'Easy',
              queText: 'What is 2+2?',
              queTypeId: 1,
              queTypeName: 'MCQ',
              queOptionsAns: [],
            },
          ],
          totalRecords: 10,
        },
      };

      quizService.getQuestions.mockReturnValue(of(mockResponse));
      component.fetchQuestions();

      expect(quizService.getQuestions).toHaveBeenCalled();
      expect(component.dataSource()).toEqual(mockResponse.data.records);
      expect(component.totalItems()).toBe(mockResponse.data.totalRecords);
    });

    it('should handle error response', () => {
      const mockResponse: ApiResponse<PaginatedDataResponse<QuestionPoolList>> = {
        result: false,
        statusCode: 400,
        message: 'failed',
        data: { records: [], totalRecords: 0 },
      };

      quizService.getQuestions.mockReturnValue(of(mockResponse));

      component.fetchQuestions();

      expect(snackbar.showError).toHaveBeenCalledWith('failed');
      expect(component.dataSource()).toEqual([]);
      expect(component.totalItems()).toBe(0);
    });

    it('should handle thrown error', () => {
      const error = { error: { message: 'err' }, status: 500 };
      quizService.getQuestions.mockReturnValue(throwError(() => error));
      component.fetchQuestions();
      expect(snackbar.showError).toHaveBeenCalledWith('Error!', 'err');
    });

    it('should handle thrown error with unknown format', () => {
      const error = 'oops';
      quizService.getQuestions.mockReturnValue(throwError(() => error));
      component.fetchQuestions();
      expect(snackbar.showError).toHaveBeenCalledWith('Error!', 'Something went wrong.');
    });
  });

  describe('searchInputChangeOption2', () => {
    it('should update searchValue and page number', () => {
      const fetchSpy = jest.spyOn(component, 'fetchQuestions');
      component.searchInputChangeOption2('test');
      expect(component.searchValue).toBe('test');
      expect(component.pagination().pageNumber).toBe(1);
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('filterChangeOption2', () => {
    it('should reset page number and call fetchQuestions', () => {
      const fetchSpy = jest.spyOn(component, 'fetchQuestions');
      component.filterChangeOption2();
      expect(component.pagination().pageNumber).toBe(1);
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('pageChangeOption2', () => {
    it('should update pagination and call fetchQuestions', () => {
      const fetchSpy = jest.spyOn(component, 'fetchQuestions');
      const event: PageEvent = { pageIndex: 1, pageSize: 5, length: 10 };
      component.pageChangeOption2(event);
      expect(component.pagination()).toEqual({ pageNumber: 2, pageSize: 5 });
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('questionSelect', () => {
    const question: QuestionPoolList = {
      id: 1,
      categoryId: 1,
      categoryName: 'Math',
      queDifficultyId: 1,
      queDifficultyName: 'Easy',
      queText: 'Q',
      queTypeId: 1,
      queTypeName: 'MCQ',
      queOptionsAns: [],
    };

    beforeEach(() => {
      component.dataSource.set([question]);
      component.selectedQuestions = [];
    });

    it('should add selected question if not over limit', () => {
      const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
      component.questionSelect(1, true);
      expect(component.selectedQuestions.length).toBe(1);
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should not add selected question if over limit', () => {
      component.selectedQuestions = [question, { ...question, id: 2 }];
      component.questionSelect(1, true);
      expect(component.selectedQuestions.length).toBe(2); // unchanged
    });

    it('should remove question if unchecked', () => {
      component.selectedQuestions = [question];
      const emitSpy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
      component.questionSelect(1, false);
      expect(component.selectedQuestions.length).toBe(0);
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should do nothing if question not found', () => {
      const initial = [...component.selectedQuestions];
      component.questionSelect(999, true);
      expect(component.selectedQuestions).toEqual(initial);
    });
  });

  describe('isQuestionDisabled', () => {
    const question = { id: 1, queDifficultyName: 'Easy' } as any;
    it('should return false if no difficulty limit', () => {
      component.quizStep1Data.difficultyDistribution = [];
      expect(component.isQuestionDisabled(question)).toBe(false);
    });

    it('should return true if limit reached and not selected', () => {
      component.selectedQuestions = [
        {
          id: 2,
          queDifficultyName: 'Easy',
          queText: 'Sample question',
          categoryId: 1,
          queDifficultyId: 1,
          queTypeId: 1,
          queTypeName: 'MCQ',
          queOptionsAns: [],
        },
        {
          id: 4,
          queDifficultyName: 'Easy',
          queText: 'Another sample',
          categoryId: 1,
          queDifficultyId: 1,
          queTypeId: 1,
          queTypeName: 'MCQ',
          queOptionsAns: [],
        },
      ];

      const question: QuestionPoolList = {
        id: 3,
        queDifficultyName: 'Easy',
        queText: 'Another question',
        categoryId: 1,
        categoryName: 'Math',
        queDifficultyId: 1,
        queTypeId: 1,
        queTypeName: 'MCQ',
        queOptionsAns: [],
      };

      expect(component.isQuestionDisabled(question)).toBe(true);
    });

    it('should return false if limit not reached', () => {
      component.selectedQuestions = [];
      expect(component.isQuestionDisabled(question)).toBe(false);
    });
  });

  describe('isQuestionSelected', () => {
    it('should return true if selected', () => {
      component.selectedQuestions = [{ id: 1 } as any];
      expect(component.isQuestionSelected(1)).toBe(true);
    });
    it('should return false if not selected', () => {
      component.selectedQuestions = [];
      expect(component.isQuestionSelected(1)).toBe(false);
    });
  });

  describe('getTypeTagConfigWithLabelInCS / getTagConfigWithDifficultyInCS', () => {
    it('should call utility functions', () => {
      const val = component.getTypeTagConfigWithLabelInCS('test');
      expect(val).toBeDefined();

      const val2 = component.getTagConfigWithDifficultyInCS('test');
      expect(val2).toBeDefined();
    });
  });

  it('should include questionDifficultyId in request filters if selectedDifficulty is set', () => {
    let capturedRequest: any;

    quizService.getQuestions.mockImplementation((req) => {
      capturedRequest = req;
      return of({
        result: true,
        statusCode: 200,
        message: 'Success',
        data: { records: [], totalRecords: 0 },
      });
    });

    component.selectedDifficulty = 2;
    component.quizStep1Data = { quizCategory: 1 } as any;
    component.fetchQuestions();

    expect(capturedRequest.filters!['questionDifficultyId']).toBe(2);
  });

  it('should set searchTerm to empty string if searchValue is null/undefined', () => {
    (component as any).searchValue = undefined;

    component.fetchQuestions();

    const requestArg = quizService.getQuestions.mock.calls[0][0];
    expect(requestArg.searchTerm).toBe('');
  });

  it('should return null if no difficultyEntry is found', () => {
    component.quizStep1Data = { difficultyDistribution: [] } as any;

    const difficultyName = 'Easy';
    const difficultyEntry = component.quizStep1Data?.difficultyDistribution?.find((d) =>
      d.key.toLowerCase().startsWith(difficultyName?.toLowerCase() ?? ''),
    );
    const difficultyLimit = difficultyEntry?.value ?? null;

    expect(difficultyLimit).toBeNull();
  });

  it('should return difficultyEntry.value if found', () => {
    component.quizStep1Data = {
      difficultyDistribution: [{ key: 'EasyQuestions', value: 10 }],
    } as any;

    const difficultyName = 'Easy';
    const difficultyEntry = component.quizStep1Data?.difficultyDistribution?.find((d) =>
      d.key.toLowerCase().startsWith(difficultyName?.toLowerCase() ?? ''),
    );
    const difficultyLimit = difficultyEntry?.value ?? null;

    expect(difficultyLimit).toBe(10);
  });

  it('should map question options with empty defaults when key/value are nullish', () => {
    const question: any = {
      id: 1,
      categoryId: 2,
      queDifficultyId: 3,
      queDifficultyName: 'Easy',
      queText: 'Sample Q',
      queTypeId: 4,
      queTypeName: 'MCQ',
      queOptionsAns: [{ id: 11, questionId: 1, key: null, value: null }],
    };

    component.selectedQuestions.push({
      id: question.id,
      categoryId: question.categoryId,
      queDifficultyId: question.queDifficultyId,
      queDifficultyName: question.queDifficultyName,
      queText: question.queText,
      queTypeId: question.queTypeId,
      queTypeName: question.queTypeName,
      queOptionsAns:
        question.queOptionsAns?.map((opt: any) => ({
          id: opt.id,
          questionId: opt.questionId,
          key: opt.key ?? '',
          value: String(opt.value ?? ''),
        })) ?? [],
    });

    expect(component.selectedQuestions[0]!.queOptionsAns![0]!.key).toBe('');
    expect(component.selectedQuestions[0]!.queOptionsAns![0]!.value).toBe('');
  });

  it('should fallback to empty array if queOptionsAns is null/undefined', () => {
    const question: any = {
      id: 2,
      categoryId: 3,
      queDifficultyId: 4,
      queDifficultyName: 'Medium',
      queText: 'Another Q',
      queTypeId: 5,
      queTypeName: 'True/False',
      queOptionsAns: null,
    };

    component.selectedQuestions.push({
      id: question.id,
      categoryId: question.categoryId,
      queDifficultyId: question.queDifficultyId,
      queDifficultyName: question.queDifficultyName,
      queText: question.queText,
      queTypeId: question.queTypeId,
      queTypeName: question.queTypeName,
      queOptionsAns:
        question.queOptionsAns?.map((opt: any) => ({
          id: opt.id,
          questionId: opt.questionId,
          key: opt.key ?? '',
          value: String(opt.value ?? ''),
        })) ?? [],
    });

    expect(component.selectedQuestions[0].queOptionsAns).toEqual([]);
  });

  it('should return first entry when difficultyName is undefined ("" after ??)', () => {
    const difficultyName = undefined;
    const difficultyEntry = component.quizStep1Data?.difficultyDistribution?.find((d) =>
      d.key.toLowerCase().startsWith(difficultyName ?? ''),
    );
    const difficultyLimit = difficultyEntry?.value ?? null;

    expect(difficultyEntry).toEqual({ key: 'Easy', value: 2 });
    expect(difficultyLimit).toBe(2);
  });

  it('should set difficultyLimit to null when no entry matches', () => {
    const difficultyName = 'NonExisting';
    const difficultyEntry = component.quizStep1Data?.difficultyDistribution?.find((d) =>
      d.key.toLowerCase().startsWith(difficultyName?.toLowerCase() ?? ''),
    );
    const difficultyLimit = difficultyEntry?.value ?? null;

    expect(difficultyEntry).toBeUndefined();
    expect(difficultyLimit).toBeNull();
  });
});
