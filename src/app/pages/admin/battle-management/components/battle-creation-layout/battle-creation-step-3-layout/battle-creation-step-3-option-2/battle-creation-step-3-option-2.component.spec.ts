import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BattleCreationStep3Option2Component } from './battle-creation-step-3-option-2.component';
import { BattleManagementService } from '../../../../../../../services/admin/battle-management/battle-management.service';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { OutlineButtonComponent } from '../../../../../../../shared/components/outline-button/outline-button.component';
import { SearchInputComponent } from '../../../../../../../shared/components/search-input/search-input.component';
import { TagComponent } from '../../../../../../../shared/components/tag/tag.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import {
  BattleStep1Data,
  QuestionPoolList,
} from '../../../../interfaces/battle-creation.interface';
import { ApiResponse } from '../../../../../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../../../../../shared/interfaces/paginated-data-response.interface';
import { debounceTimeValue, quizCRUDMessages } from '../../../../../../../utils/constants';
import { BattleTimeType } from '../../../../../../../shared/enums/battle-management.enum';

jest.mock('../../../../../../../services/admin/battle-management/battle-management.service');
jest.mock('../../../../../../../shared/service/snackbar/snackbar.service');

describe('BattleCreationStep3Option2Component', () => {
  let component: BattleCreationStep3Option2Component;
  let fixture: ComponentFixture<BattleCreationStep3Option2Component>;
  let battleManagementService: jest.Mocked<BattleManagementService>;
  let snackbarService: jest.Mocked<SnackbarService>;

  // Mock data
  const mockBattleStep1Data: BattleStep1Data = {
    categoryId: 1,
    difficultyLevelId: 1,
    name: 'Sample Battle',
    description: 'A sample battle description',
    battleType: BattleTimeType.Permanent,
    status: 1,
    startDate: new Date(),
    endDate: new Date(),
    totalTime: 300,
    totalQuestion: 5,
    totalXp: 100,
    questionsDifficulty: [
      { queDifficultyId: 1, noOfQues: 2, timePerQuestion: 30 },
      { queDifficultyId: 2, noOfQues: 3, timePerQuestion: 45 },
      { queDifficultyId: 3, noOfQues: 0, timePerQuestion: 60 },
    ],
  };

  const mockQuestionDifficultyOption = [
    { value: 1, label: 'Easy' },
    { value: 2, label: 'Medium' },
  ];

  const mockQuestions: QuestionPoolList[] = [
    {
      id: 1,
      categoryId: 1,
      categoryName: 'Technology',
      queDifficultyId: 1,
      queDifficultyName: 'Easy',
      queText: 'What is 2+2?',
      queTypeId: 1,
      queTypeName: 'Multiple Choice',
      queOptionsAns: [
        { id: 1, questionId: 1, key: 'A', value: '4' },
        { id: 2, questionId: 1, key: 'B', value: '5' },
      ],
    },
    {
      id: 2,
      categoryId: 1,
      categoryName: 'Technology',
      queDifficultyId: 2,
      queDifficultyName: 'Medium',
      queText: 'What is the capital of France?',
      queTypeId: 1,
      queTypeName: 'Multiple Choice',
      queOptionsAns: [
        { id: 3, questionId: 2, key: 'A', value: 'Paris' },
        { id: 4, questionId: 2, key: 'B', value: 'London' },
      ],
    },
  ];

  const mockApiResponse: ApiResponse<PaginatedDataResponse<QuestionPoolList>> = {
    result: true,
    statusCode: 200,
    message: 'Success',
    data: {
      totalRecords: 2,
      records: mockQuestions,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BattleCreationStep3Option2Component,
        HttpClientTestingModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        OutlineButtonComponent,
        SearchInputComponent,
        TagComponent,
        MatFormFieldModule,
        MatSelectModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatPaginatorModule,
      ],
      providers: [
        {
          provide: BattleManagementService,
          useValue: {
            getQuestions: jest.fn().mockReturnValue(of(mockApiResponse)),
          },
        },
        {
          provide: SnackbarService,
          useValue: {
            showError: jest.fn(),
            showSuccess: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep3Option2Component);
    component = fixture.componentInstance;
    battleManagementService = TestBed.inject(
      BattleManagementService,
    ) as jest.Mocked<BattleManagementService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;

    // Set default inputs
    component.battleStep1Data = mockBattleStep1Data;
    component.questionDifficultyOption = mockQuestionDifficultyOption;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 1. Component Initialization
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchQuestions on init', () => {
    expect(battleManagementService.getQuestions).toHaveBeenCalled();
    expect(component.dataSource().length).toBe(2);
    expect(component.totalItems()).toBe(2);
  });

  // 2. Search Functionality
  it('should debounce and fetch questions on search input change', fakeAsync(() => {
    const spy = jest.spyOn(component, 'fetchQuestions');
    component.searchInputChangeOption2('test');
    expect(spy).not.toHaveBeenCalled();
    tick(debounceTimeValue);
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  // 3. Pagination
  it('should update pagination and fetch questions on page change', () => {
    const spy = jest.spyOn(component, 'fetchQuestions');
    const pageEvent = { pageIndex: 1, pageSize: 10, length: 20 };
    component.pageChangeOption2(pageEvent);
    expect(component.pagination().pageNumber).toBe(2);
    expect(component.pagination().pageSize).toBe(10);
    expect(spy).toHaveBeenCalled();
  });

  // 4. Filtering
  it('should reset pagination and fetch questions on filter change', () => {
    const spy = jest.spyOn(component, 'fetchQuestions');
    component.selectedDifficulty = 1;
    component.filterChangeOption2();
    expect(component.pagination().pageNumber).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should include categoryId and difficultyId in request when set', () => {
    component.selectedDifficulty = 2;
    const spy = jest.spyOn(battleManagementService, 'getQuestions');
    component.fetchQuestions();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          quizCategoryId: mockBattleStep1Data.categoryId,
          questionDifficultyId: 2,
        }),
      }),
    );
  });

  it('should include only categoryId in request when difficulty is not set', () => {
    component.selectedDifficulty = undefined;
    const spy = jest.spyOn(battleManagementService, 'getQuestions');
    component.fetchQuestions();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          quizCategoryId: mockBattleStep1Data.categoryId,
        }),
      }),
    );
  });

  // 5. Question Selection
  it('should add question to selectedQuestions and emit event when checked', () => {
    const spy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option2, 'emit');
    component.questionSelect(1, true);
    expect(component.selectedQuestions.length).toBe(1);
    expect(component.selectedQuestions[0].id).toBe(1);
    expect(spy).toHaveBeenCalledWith([expect.objectContaining({ id: 1 })]);
    expect(snackbarService.showSuccess).toHaveBeenCalledWith(quizCRUDMessages.questionAdded);
  });

  it('should not add question if difficulty limit is reached', () => {
    component.selectedQuestions = [
      {
        id: 3,
        queDifficultyId: 1,
        queText: 'Test',
        queTypeId: 1,
        queTypeName: 'MCQ',
        categoryId: 1,
        queDifficultyName: 'Easy',
        queOptionsAns: [],
      },
      {
        id: 4,
        queDifficultyId: 1,
        queText: 'Test2',
        queTypeId: 1,
        queTypeName: 'MCQ',
        categoryId: 1,
        queDifficultyName: 'Easy',
        queOptionsAns: [],
      },
    ];
    const spy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option2, 'emit');
    component.questionSelect(1, true);
    expect(component.selectedQuestions.length).toBe(2); // No new question added
    expect(spy).not.toHaveBeenCalled();
    expect(snackbarService.showSuccess).not.toHaveBeenCalled();
  });

  it('should remove question from selectedQuestions and emit event when unchecked', () => {
    component.selectedQuestions = [mockQuestions[0]];
    const spy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option2, 'emit');
    component.questionSelect(1, false);
    expect(component.selectedQuestions.length).toBe(0);
    expect(spy).toHaveBeenCalledWith([]);
    expect(snackbarService.showSuccess).toHaveBeenCalledWith(quizCRUDMessages.questionAdded);
  });

  it('should not emit or show snackbar if question is not found', () => {
    const spy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option2, 'emit');
    component.questionSelect(999, true);
    expect(component.selectedQuestions.length).toBe(0);
    expect(spy).not.toHaveBeenCalled();
    expect(snackbarService.showSuccess).not.toHaveBeenCalled();
  });

  // 6. UI Rendering
  it('should render child components', () => {
    expect(fixture.debugElement.query(By.directive(OutlineButtonComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(SearchInputComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(MatSelect))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(MatPaginator))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(TagComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('mat-checkbox'))).toBeTruthy();
  });

  it('should display questions when dataSource is not empty', () => {
    fixture.detectChanges();
    const questionElements = fixture.debugElement.queryAll(By.css('.border.border-gray-200'));
    expect(questionElements.length).toBe(2);
    expect(questionElements[0].nativeElement.textContent).toContain('What is 2+2?');
  });

  it('should display "No data available" when dataSource is empty', () => {
    component.dataSource.set([]);
    fixture.detectChanges();
    const noDataElement = fixture.debugElement.query(By.css('.text-black-500'));
    expect(noDataElement).toBeTruthy();
    expect(noDataElement.nativeElement.textContent).toContain('No data available');
  });

  // 7. Error Handling
  it('should show snackbar error when API returns result: false', () => {
    const failedApiResponse = {
      result: false,
      statusCode: 400,
      message: 'Bad Request',
      data: { totalRecords: 0, records: [] },
    };
    battleManagementService.getQuestions.mockReturnValueOnce(of(failedApiResponse));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');
    component.fetchQuestions();
    expect(snackbarSpy).toHaveBeenCalledWith('Bad Request');
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });

  it('should show snackbar error when API throws an error', () => {
    const mockError = { error: { message: 'Internal Server Error' }, status: 500 };
    battleManagementService.getQuestions.mockReturnValueOnce(throwError(() => mockError));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');
    component.fetchQuestions();
    expect(snackbarSpy).toHaveBeenCalledWith('Internal Server Error', 'Error 500');
  });

  it('should handle unknown error structure and show fallback snackbar error', () => {
    battleManagementService.getQuestions.mockReturnValueOnce(throwError(() => ({})));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');
    component.fetchQuestions();
    expect(snackbarSpy).toHaveBeenCalledWith('Unexpected error occurred', 'Error Unknown');
  });

  // 8. Question Disabled Logic
  it('should disable question checkbox when difficulty limit is reached', () => {
    component.selectedQuestions = [
      {
        id: 3,
        queDifficultyId: 1,
        queText: 'Test',
        queTypeId: 1,
        queTypeName: 'MCQ',
        categoryId: 1,
        queDifficultyName: 'Easy',
        queOptionsAns: [],
      },
      {
        id: 4,
        queDifficultyId: 1,
        queText: 'Test2',
        queTypeId: 1,
        queTypeName: 'MCQ',
        categoryId: 1,
        queOptionsAns: [],
      },
    ];
    expect(component.isQuestionDisabled(mockQuestions[0])).toBe(true);
    expect(component.isQuestionDisabled(mockQuestions[1])).toBe(false);
  });

  it('should not disable question checkbox if question is already selected', () => {
    component.selectedQuestions = [mockQuestions[0]];
    expect(component.isQuestionDisabled(mockQuestions[0])).toBe(false);
  });

  it('should not disable question checkbox if no difficulty limit is set', () => {
    component.battleStep1Data = {
      categoryId: 1,
      difficultyLevelId: 1,
      name: 'Sample Battle',
      description: 'A sample battle description',
      battleType: BattleTimeType.Permanent,
      status: 1,
      startDate: new Date(),
      endDate: new Date(),
      totalTime: 300,
      totalQuestion: 5,
      totalXp: 100,
      questionsDifficulty: [],
    };
    expect(component.isQuestionDisabled(mockQuestions[0])).toBe(false);
  });

  // 9. Tag Configuration
  it('should return correct tag config for question type', () => {
    const tagConfig = component.getTypeTagConfigWithLabelInCS('Multiple Choice');
    expect(tagConfig).toHaveProperty('label', 'Multiple Choice');
  });

  it('should return correct tag config for difficulty', () => {
    const tagConfig = component.getTagConfigWithDifficultyInCS('Easy');
    expect(tagConfig).toHaveProperty('label', 'Easy');
  });

  // 10. Close Option
  it('should emit closeQuestionAdditionOption event when closeOption is called', () => {
    const spy = jest.spyOn(component.closeQuestionAdditionOption, 'emit');
    component.closeOption();
    expect(spy).toHaveBeenCalled();
  });

  // 11. Question Selection State
  it('should correctly identify selected questions', () => {
    component.selectedQuestions = [mockQuestions[0]];
    expect(component.isQuestionSelected(1)).toBe(true);
    expect(component.isQuestionSelected(2)).toBe(false);
  });
});
