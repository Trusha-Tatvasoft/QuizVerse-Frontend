import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BattleCreationStep3LayoutComponent } from './battle-creation-step-3-layout.component';
import { BattleManagementService } from '../../../../../../services/admin/battle-management/battle-management.service';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../../../shared/components/table/table.component';
import { BattleCreationStep3Option1Component } from './battle-creation-step-3-option-1/battle-creation-step-3-option-1.component';
import { BattleCreationStep3Option2Component } from './battle-creation-step-3-option-2/battle-creation-step-3-option-2.component';
import { BattleCreationStep3Option3Component } from './battle-creation-step-3-option-3/battle-creation-step-3-option-3.component';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { BattleStep1Data, QuestionsList } from '../../../interfaces/battle-creation.interface';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { DropDownType } from '../../../../../../shared/enums/dropdown-types.enum';

jest.mock('../../../../../../services/admin/battle-management/battle-management.service');
jest.mock('../../../../../../shared/service/snackbar/snackbar.service');
jest.mock('@angular/material/dialog');

describe('BattleCreationStep3LayoutComponent', () => {
  let component: BattleCreationStep3LayoutComponent;
  let fixture: ComponentFixture<BattleCreationStep3LayoutComponent>;
  let battleManagementService: jest.Mocked<BattleManagementService>;
  let snackbarService: jest.Mocked<SnackbarService>;
  let dialog: jest.Mocked<MatDialog>;

  // Mock data
  const mockBattleStep1Data: BattleStep1Data = {
    name: 'Test Battle',
    description: 'Test Description',
    difficultyLevelId: 2,
    difficultyLevelName: 'Medium',
    categoryId: 1,
    battleCategoryName: 'General Knowledge',
    status: 1,
    battleType: 1,
    battleTypeName: 'Permanent',
    startDate: new Date(),
    endDate: new Date(),
    totalTime: 30,
    totalQuestion: 10,
    totalXp: 100,
    questionsDifficulty: [
      { queDifficultyId: 1, noOfQues: 5, timePerQuestion: 30 },
      { queDifficultyId: 2, noOfQues: 3, timePerQuestion: 45 },
      { queDifficultyId: 3, noOfQues: 2, timePerQuestion: 60 },
    ],
  };

  const mockQuestions: QuestionsList[] = [
    {
      id: 1,
      categoryId: 1,
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

  const mockDropdownResponse = {
    result: true,
    statusCode: 200,
    message: 'Success',
    data: [
      { id: 1, name: 'Easy' },
      { id: 2, name: 'Medium' },
      { id: 3, name: 'Hard' },
    ],
  };

  const mockQuestionsResponse = {
    result: true,
    statusCode: 200,
    message: 'Success',
    data: mockQuestions,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BattleCreationStep3LayoutComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatIconModule,
        CommonModule,
        TableComponent,
        BattleCreationStep3Option1Component,
        BattleCreationStep3Option2Component,
        BattleCreationStep3Option3Component,
      ],
      providers: [
        {
          provide: BattleManagementService,
          useValue: {
            getDropDownData: jest.fn().mockReturnValue(of(mockDropdownResponse)),
            getQuestions: jest.fn().mockReturnValue(of(mockQuestionsResponse)),
          },
        },
        {
          provide: SnackbarService,
          useValue: {
            showError: jest.fn(),
            showSuccess: jest.fn(),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: jest.fn().mockReturnValue({
              afterClosed: jest.fn().mockReturnValue(of(true)),
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep3LayoutComponent);
    component = fixture.componentInstance;
    battleManagementService = TestBed.inject(
      BattleManagementService,
    ) as jest.Mocked<BattleManagementService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    dialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;

    // Set default inputs
    component.battleStep1Data = mockBattleStep1Data;
    component.selectedQuestions = [...mockQuestions];
    component.updateSelectedQuestionsTable();
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getDropDownsData on init', () => {
    const spy = jest.spyOn(battleManagementService, 'getDropDownData');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(DropDownType.QuestionDifficulty);
    expect(spy).toHaveBeenCalledWith(DropDownType.QuestionType);
    expect(component.questionDifficultyOption).toEqual([
      { value: 1, label: 'Easy' },
      { value: 2, label: 'Medium' },
      { value: 3, label: 'Hard' },
    ]);
    expect(component.questionTypeOptions).toEqual([
      { value: 1, label: 'Easy' },
      { value: 2, label: 'Medium' },
      { value: 3, label: 'Hard' },
    ]);
  });

  it('should render question addition option cards when isInnerStep3 is false', () => {
    component.isInnerStep3 = false;
    fixture.detectChanges();
    const cards = fixture.debugElement.queryAll(By.css('.grid > div'));
    expect(cards.length).toBe(component.questionAdditionOptionsInManualMethodStep3.length);
    expect(cards[0].nativeElement.textContent).toContain(
      component.questionAdditionOptionsInManualMethodStep3[0].title,
    );
  });

  it('should render option 1 component when selectedQuestionMethodInManualAdditionIndex is 0', () => {
    component.isInnerStep3 = true;
    component.selectedQuestionMethodInManualAdditionIndex = 0;
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.directive(BattleCreationStep3Option1Component)),
    ).toBeTruthy();
  });

  it('should render option 3 component when selectedQuestionMethodInManualAdditionIndex is 2', () => {
    component.isInnerStep3 = true;
    component.selectedQuestionMethodInManualAdditionIndex = 2;
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.directive(BattleCreationStep3Option3Component)),
    ).toBeTruthy();
  });

  it('should render table when totalQuestionsSelected is greater than 0', () => {
    component.totalQuestionsSelected = 2;
    component.updateSelectedQuestionsTable();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(TableComponent))).toBeTruthy();
    const headings = fixture.debugElement.queryAll(By.css('.form-heading'));
    expect(headings[1].nativeElement.textContent).toContain('Added Questions (2)');
  });

  it('should not render table when totalQuestionsSelected is 0', () => {
    component.totalQuestionsSelected = 0;
    component.selectedQuestions = [];
    component.updateSelectedQuestionsTable();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(TableComponent))).toBeNull();
  });

  it('should set isInnerStep3 and selectedQuestionMethodInManualAdditionIndex on card click', () => {
    component.cardClick(1);
    expect(component.isInnerStep3).toBe(true);
    expect(component.selectedQuestionMethodInManualAdditionIndex).toBe(1);
  });

  it('should handle error when fetching dropdown data', () => {
    const error = { message: 'Failed to fetch dropdowns', status: 500 };
    battleManagementService.getDropDownData.mockReturnValueOnce(throwError(() => error));
    component.getDropDownsData();
    expect(snackbarService.showError).toHaveBeenCalledWith(error);
  });

  it('should update selectedQuestions and table on selectedQuestionsChangeFromInnerStep3OptionsParent', () => {
    const spy = jest.spyOn(component, 'updateSelectedQuestionsTable');
    const newQuestions = [...mockQuestions];
    component.selectedQuestionsChangeFromInnerStep3OptionsParent(newQuestions);
    expect(component.selectedQuestions).toEqual(newQuestions);
    expect(component.totalQuestionsSelected).toBe(2);
    expect(spy).toHaveBeenCalled();
  });

  it('should close inner step 3 on closeQuestionAdditionOptionParent', () => {
    component.isInnerStep3 = true;
    component.closeQuestionAdditionOptionParent();
    expect(component.isInnerStep3).toBe(false);
  });

  it('should update questionsTableData and emit selectedQuestions on updateSelectedQuestionsTable', () => {
    const spy = jest.spyOn(component.selectedQuestionsChange, 'emit');
    component.updateSelectedQuestionsTable();
    expect(component.questionsTableData.length).toBe(2);
    expect(component.questionsTableData[0]['queText']).toBe('What is 2+2?');
    expect(spy).toHaveBeenCalledWith(mockQuestions);
    expect(component.totalQuestionsSelected).toBe(2);
  });

  it('should adjust currentPageSelected when last question on page is deleted', () => {
    component.currentPageSelected = 2;
    component.pageSizeSelected = 1;
    component.selectedQuestions = [mockQuestions[0]]; // Only 1 question
    component.updateSelectedQuestionsTable();
    expect(component.currentPageSelected).toBe(1); // Should go back to page 1
  });

  it('should update table on page change', () => {
    const spy = jest.spyOn(component, 'updateSelectedQuestionsTable');
    component.pageChangeTableSelectedQuestions({ pageIndex: 1, pageSize: 1 });
    expect(component.currentPageSelected).toBe(2);
    expect(component.pageSizeSelected).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should open confirmation dialog and delete question on confirm', () => {
    const dialogRefMock = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    dialog.open.mockReturnValueOnce(dialogRefMock as any);
    const spy = jest.spyOn(component, 'updateSelectedQuestionsTable');
    component.questionsTableData = [
      {
        queText: 'What is 2+2?',
        queTypeName: { tagConfig: { label: 'Multiple Choice' } },
        queDifficultyName: { tagConfig: { label: 'Easy' } },
        action: [{ icon: 'delete', tooltip: 'Delete Question' }],
        index: 0,
      },
    ];
    component.handleDeleteAction({ action: 'delete', row: component.questionsTableData[0] });
    expect(dialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, expect.any(Object));
    expect(component.selectedQuestions.length).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should not delete question if dialog is not confirmed', () => {
    const dialogRefMock = {
      afterClosed: jest.fn().mockReturnValue(of(false)),
    };
    dialog.open.mockReturnValueOnce(dialogRefMock as any);
    const spy = jest.spyOn(component, 'updateSelectedQuestionsTable');
    component.questionsTableData = [
      {
        queText: 'What is 2+2?',
        queTypeName: { tagConfig: { label: 'Multiple Choice' } },
        queDifficultyName: { tagConfig: { label: 'Easy' } },
        action: [{ icon: 'delete', tooltip: 'Delete Question' }],
        index: 0,
      },
    ];
    component.handleDeleteAction({ action: 'delete', row: component.questionsTableData[0] });
    expect(dialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, expect.any(Object));
    expect(component.selectedQuestions.length).toBe(2);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should validate selected questions within limits', () => {
    const spy = jest.spyOn(component.validSelectedQuestionsChange, 'emit');
    component.updateSelectedQuestionsValidity();
    expect(component.isValidSelectedQuestions).toBe(true);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should invalidate when difficulty limit is exceeded', () => {
    // Add more questions to exceed the limit
    component.selectedQuestions = [
      ...mockQuestions,
      { ...mockQuestions[0], id: 3 },
      { ...mockQuestions[0], id: 4 },
      { ...mockQuestions[0], id: 5 },
      { ...mockQuestions[0], id: 5 },
      { ...mockQuestions[0], id: 6 },
    ];
    const spy = jest.spyOn(component.validSelectedQuestionsChange, 'emit');
    component.updateSelectedQuestionsValidity();
    expect(component.isValidSelectedQuestions).toBe(false);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should invalidate when total question limit is exceeded', () => {
    component.selectedQuestions = [
      ...mockQuestions,
      { ...mockQuestions[0], id: 3 },
      { ...mockQuestions[0], id: 4 },
      { ...mockQuestions[0], id: 5 },
      { ...mockQuestions[0], id: 6 },
      { ...mockQuestions[0], id: 7 },
      { ...mockQuestions[0], id: 8 },
      { ...mockQuestions[0], id: 9 },
      { ...mockQuestions[0], id: 10 },
      { ...mockQuestions[0], id: 11 },
    ];
    const spy = jest.spyOn(component.validSelectedQuestionsChange, 'emit');
    component.updateSelectedQuestionsValidity();
    expect(component.isValidSelectedQuestions).toBe(false);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should fill missing labels for selected questions', () => {
    component.selectedQuestions = [
      {
        id: 1,
        categoryId: 1,
        queDifficultyId: 1,
        queText: 'What is 2+2?',
        queTypeId: 1,
        queOptionsAns: [],
      },
    ];
    component.questionDifficultyOption = [{ value: 1, label: 'Easy' }];
    component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];
    component.fillMissingLabelsForSelectedQuestions();
    expect(component.selectedQuestions[0].queDifficultyName).toBe('Easy');
    expect(component.selectedQuestions[0].queTypeName).toBe('Multiple Choice');
  });

  it('should not modify questions with existing labels', () => {
    component.selectedQuestions = [mockQuestions[0]];
    component.questionDifficultyOption = [{ value: 1, label: 'Easy' }];
    component.questionTypeOptions = [{ value: 1, label: 'Multiple Choice' }];
    component.fillMissingLabelsForSelectedQuestions();
    expect(component.selectedQuestions[0].queDifficultyName).toBe('Easy');
    expect(component.selectedQuestions[0].queTypeName).toBe('Multiple Choice');
  });

  it('should return correct tag config for question type', () => {
    const tagConfig = component.getTypeTagConfigWithLabelInCS('Multiple Choice');
    expect(tagConfig).toHaveProperty('label', 'Multiple Choice');
  });

  it('should return correct tag config for difficulty', () => {
    const tagConfig = component.getTagConfigWithDifficultyInCS('Easy');
    expect(tagConfig).toHaveProperty('label', 'Easy');
  });

  it('should correctly identify selected questions', () => {
    expect(component.isQuestionSelected(1)).toBe(true);
    expect(component.isQuestionSelected(999)).toBe(false);
  });

  it('should complete destroy$ subject on ngOnDestroy', () => {
    const spy = jest.spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
