import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BattleCreationStep4Component } from './battle-creation-step-4.component';
import { BattleManagementService } from '../../../../../../services/admin/battle-management/battle-management.service';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import {
  BattleStep1Data,
  QuestionsList,
  QuestionDifficultyXP,
} from '../../../interfaces/battle-creation.interface';
import { platformMessages, quizCRUDMessages } from '../../../../../../utils/constants';
import { TagInputConfig } from '../../../../../../shared/interfaces/tag-component.interface';
import {
  getTagConfigWithCustomization,
  getTagConfigWithDifficulty,
  getTypeTagConfigWithLabel,
} from '../../../../../../utils/quiz-crud-common-functions.utils';
import { By } from '@angular/platform-browser';

jest.mock('../../../../../../utils/quiz-crud-common-functions.utils', () => ({
  getTagConfigWithCustomization: jest.fn(),
  getTagConfigWithDifficulty: jest.fn(),
  getTypeTagConfigWithLabel: jest.fn(),
}));

describe('BattleCreationStep4Component', () => {
  let component: BattleCreationStep4Component;
  let fixture: ComponentFixture<BattleCreationStep4Component>;
  let battleService: jest.Mocked<BattleManagementService>;
  let snackbarService: jest.Mocked<SnackbarService>;
  let dialog: jest.Mocked<MatDialog>;

  const mockDifficultyFields = {
    easyQuestions: 2,
    mediumQuestions: 2,
    hardQuestions: 1,
  };

  const mockBattleStep1Data: BattleStep1Data = {
    ...mockDifficultyFields,
    name: 'Test Battle',
    description: 'A mock battle',
    battleCategoryName: 'General',
    difficultyLevelName: 'Easy',
    battleTypeName: 'Standard',
    totalTime: 30,
    totalXp: 100,
    categoryId: 1,
    difficultyLevelId: 1,
    battleType: 1,
    startDate: new Date('2025-08-19'),
    endDate: new Date('2025-08-20'),
    totalQuestion: 5,
    questionsDifficulty: [
      { queDifficultyId: 1, noOfQues: 2, timePerQuestion: 30 },
      { queDifficultyId: 2, noOfQues: 2, timePerQuestion: 45 },
      { queDifficultyId: 3, noOfQues: 1, timePerQuestion: 60 },
    ],
  };

  const mockSelectedQuestions: QuestionsList[] = [
    {
      id: 1,
      queText: 'What is 2+2?',
      queTypeId: 1,
      queTypeName: 'Multiple Choice',
      queDifficultyId: 1,
      queDifficultyName: 'Easy',
      categoryId: 1,
      queOptionsAns: [
        { id: 1, key: 'option', value: '4' },
        { id: 2, key: 'option', value: '5' },
        { id: 3, key: 'answer', value: '4' },
      ],
    },
    {
      id: 2,
      queText: 'Is the sky blue?',
      queTypeId: 2,
      queTypeName: 'True/False',
      queDifficultyId: 2,
      queDifficultyName: 'Medium',
      categoryId: 1,
      queOptionsAns: [{ id: 4, key: 'answer', value: 'True' }],
    },
  ];

  const mockQuestionDifficultyOption = [
    { value: 1, label: 'Easy' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'Hard' },
  ];

  const mockQuestionsDifficultyXPOption: QuestionDifficultyXP[] = [
    { questionDifficultyId: 1, questionDifficultyName: 'Easy', xpGained: 10 },
    { questionDifficultyId: 2, questionDifficultyName: 'Medium', xpGained: 20 },
    { questionDifficultyId: 3, questionDifficultyName: 'Hard', xpGained: 30 },
  ];

  const mockTagConfig: TagInputConfig = {
    id: '1',
    label: 'Tag',
    type: 'static',
    isSelected: false,
    hasBorder: true,
    backgroundColor: 'lightGreen',
    textColor: 'green',
  };

  beforeEach(async () => {
    const battleServiceMock = {
      exportCsv: jest.fn(),
    };
    const snackbarServiceMock = {
      showError: jest.fn(),
    };
    const dialogMock = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [BattleCreationStep4Component, HttpClientTestingModule, MatDialogModule],
      providers: [
        { provide: BattleManagementService, useValue: battleServiceMock },
        { provide: SnackbarService, useValue: snackbarServiceMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep4Component);
    component = fixture.componentInstance;
    battleService = TestBed.inject(BattleManagementService) as jest.Mocked<BattleManagementService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    dialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;

    // Set input properties
    component.battleStep1Data = mockBattleStep1Data;
    component.selectedQuestions = mockSelectedQuestions;
    component.questionDifficultyOption = mockQuestionDifficultyOption;
    component.questionsDifficultyXPOption = mockQuestionsDifficultyXPOption;

    // Mock tag utility functions
    (getTagConfigWithCustomization as jest.Mock).mockReturnValue(mockTagConfig);
    (getTagConfigWithDifficulty as jest.Mock).mockReturnValue(mockTagConfig);
    (getTypeTagConfigWithLabel as jest.Mock).mockReturnValue(mockTagConfig);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with input properties', () => {
    expect(component.battleStep1Data).toEqual(mockBattleStep1Data);
    expect(component.selectedQuestions).toEqual(mockSelectedQuestions);
    expect(component.questionDifficultyOption).toEqual(mockQuestionDifficultyOption);
    expect(component.questionsDifficultyXPOption).toEqual(mockQuestionsDifficultyXPOption);
  });

  it('should clean up subscriptions on destroy', () => {
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  describe('formatDate', () => {
    it('should format date string to en-GB format', () => {
      const result = component['formatDate']('2025-08-19');
      expect(result).toBe('19 Aug 2025');
    });

    it('should format Date object to en-GB format', () => {
      const result = component['formatDate'](new Date('2025-08-19'));
      expect(result).toBe('19 Aug 2025');
    });
  });

  describe('totalQuestions', () => {
    it('should calculate total questions from questionsDifficulty', () => {
      const total = component.totalQuestions(mockBattleStep1Data);
      expect(total).toBe(5);
    });

    it('should return 0 if no question fields are present', () => {
      const emptyData: BattleStep1Data = {
        name: 'Test',
        description: '',
        battleCategoryName: '',
        difficultyLevelName: '',
        battleTypeName: '',
        totalTime: 30,
        totalXp: 100,
        categoryId: 0,
        difficultyLevelId: 0,
        battleType: 0,
        startDate: new Date(),
        endDate: new Date(),
        totalQuestion: 0,
        questionsDifficulty: [],
      };
      const total = component.totalQuestions(emptyData);
      expect(total).toBe(0);
    });
  });

  describe('getDifficultyName', () => {
    it('should return difficulty name for a given ID', () => {
      const name = component.getDifficultyName(1);
      expect(name).toBe('Easy');
    });

    it('should return empty string if ID is not found', () => {
      const name = component.getDifficultyName(999);
      expect(name).toBe('');
    });
  });

  describe('getXpPerQuestion', () => {
    it('should return XP for a given difficulty ID', () => {
      const xp = component.getXpPerQuestion(1);
      expect(xp).toBe(10);
    });

    it('should return 0 if difficulty ID is not found', () => {
      const xp = component.getXpPerQuestion(999);
      expect(xp).toBe(0);
    });
  });

  describe('getMCQOptions', () => {
    it('should return comma-separated options for MCQ question', () => {
      const options = component.getMCQOptions(mockSelectedQuestions[0]);
      expect(options).toBe('4, 5');
    });

    it('should return empty string if queOptionsAns is undefined', () => {
      const question: QuestionsList = { id: 3, queText: 'Test', queTypeId: 1 };
      const options = component.getMCQOptions(question);
      expect(options).toBe('');
    });

    it('should return empty string if no options are present', () => {
      const question: QuestionsList = {
        id: 3,
        queText: 'Test',
        queTypeId: 1,
        queOptionsAns: [{ id: 1, key: 'answer', value: '4' }],
      };
      const options = component.getMCQOptions(question);
      expect(options).toBe('');
    });
  });

  describe('getAnswer', () => {
    it('should return answer for a question', () => {
      const answer = component.getAnswer(mockSelectedQuestions[0]);
      expect(answer).toBe('4');
    });

    it('should return empty string if queOptionsAns is undefined', () => {
      const question: QuestionsList = { id: 3, queText: 'Test', queTypeId: 1 };
      const answer = component.getAnswer(question);
      expect(answer).toBe('');
    });

    it('should return empty string if no answer is found', () => {
      const question: QuestionsList = {
        id: 3,
        queText: 'Test',
        queTypeId: 1,
        queOptionsAns: [{ id: 1, key: 'option', value: '4' }],
      };
      const answer = component.getAnswer(question);
      expect(answer).toBe('');
    });
  });

  describe('exportCsv', () => {
    it('should export CSV and trigger download', () => {
      const mockBlob = new Blob([''], { type: 'text/csv' });
      battleService.exportCsv.mockReturnValue(of(mockBlob));

      // Mock window.URL methods manually using a local mock
      const originalCreateObjectURL = window.URL.createObjectURL;
      const originalRevokeObjectURL = window.URL.revokeObjectURL;
      const url = 'mock-url';
      const createObjectURLMock = jest.fn(() => url);
      const revokeObjectURLMock = jest.fn();
      window.URL.createObjectURL = createObjectURLMock;
      window.URL.revokeObjectURL = revokeObjectURLMock;

      const clickMock = jest.fn();
      const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(
        () =>
          ({
            href: url,
            download: `${mockBattleStep1Data.name}_questions.csv`,
            click: clickMock,
          }) as any,
      );

      component.exportCsv();

      expect(battleService.exportCsv).toHaveBeenCalledWith({
        quizName: mockBattleStep1Data.name,
        questions: expect.arrayContaining([
          expect.objectContaining({ id: 1, queText: 'What is 2+2?' }),
          expect.objectContaining({ id: 2, queText: 'Is the sky blue?' }),
        ]),
      });
      expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
      expect(clickMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith(url);

      // Cleanup mocks by restoring original methods
      window.URL.createObjectURL = originalCreateObjectURL;
      window.URL.revokeObjectURL = originalRevokeObjectURL;
      createElementSpy.mockRestore();
    });

    it('should show error if battleStep1Data.name is undefined', () => {
      component.battleStep1Data = { ...mockBattleStep1Data, name: '' };
      component.exportCsv();
      expect(battleService.exportCsv).not.toHaveBeenCalled();
      expect(snackbarService.showError).toHaveBeenCalledWith(
        platformMessages.battleTitleNotFoundError,
      );
    });

    it('should show error on export failure', () => {
      battleService.exportCsv.mockReturnValue(throwError(() => new Error('Export failed')));
      component.exportCsv();
      expect(battleService.exportCsv).toHaveBeenCalled();
      expect(snackbarService.showError).toHaveBeenCalledWith(
        quizCRUDMessages.failedToExportQuestions,
      );
    });
  });

  it('should render battle information', () => {
    const infoSection = fixture.nativeElement.querySelector('.grid > div:first-child');
    expect(infoSection.querySelector('h3').textContent).toContain('Battle Information');
    expect(infoSection.textContent).toContain('Title: Test Battle');
    expect(infoSection.textContent).toContain('Category: General');
    expect(infoSection.textContent).toContain('Description: A mock battle');
    expect(infoSection.textContent).toContain('Total Time: 30 minutes');
    expect(infoSection.textContent).toContain('Battle Difficulty: Easy');
    expect(infoSection.textContent).toContain('Type: Standard');
    expect(infoSection.textContent).toContain('Start Date: Aug 19, 2025');
    expect(infoSection.textContent).toContain('End Date: Aug 20, 2025');
  });

  it('should render questions summary', async () => {
    component.battleStep1Data = mockBattleStep1Data;
    component.questionDifficultyOption = mockQuestionDifficultyOption;
    component.questionsDifficultyXPOption = mockQuestionsDifficultyXPOption;

    fixture.detectChanges();
    await fixture.whenStable();

    const summarySection = fixture.nativeElement.querySelector('.grid > div:last-child');
    expect(summarySection.querySelector('h3').textContent).toContain('Questions Summary');
    expect(summarySection.textContent).toContain('Total Questions: 5');
    expect(summarySection.textContent).toContain('Easy  (30s/each, 10xp/each): 2');
    expect(summarySection.textContent).toContain('Medium  (45s/each, 20xp/each): 2');
    expect(summarySection.textContent).toContain('Hard  (60s/each, 30xp/each): 1');
    expect(summarySection.textContent).toContain('Total Xp: 100');
  });

  it('should render questions with tags and answers', () => {
    const questionElements = fixture.nativeElement.querySelectorAll('.max-h-150 > div');
    expect(questionElements.length).toBe(2);

    const mcqQuestion = questionElements[0];
    expect(mcqQuestion.querySelector('.font-semibold').textContent).toContain('1. What is 2+2?');
    expect(mcqQuestion.querySelectorAll('app-tag').length).toBe(2);
    expect(mcqQuestion.querySelector('.text-sm').textContent).toContain('Options: 4, 5');
    expect(mcqQuestion.querySelector('.text-green-600').textContent).toContain('Answer: 4');

    const boolQuestion = questionElements[1];
    expect(boolQuestion.querySelector('.font-semibold').textContent).toContain(
      '2. Is the sky blue?',
    );
    expect(boolQuestion.querySelectorAll('app-tag').length).toBe(2);
    expect(boolQuestion.querySelector('.text-green-600').textContent).toContain('Answer: True');
  });

  it('should trigger exportCsv on export button click', () => {
    jest.spyOn(component, 'exportCsv');
    const exportButton = fixture.debugElement.query(
      By.css('app-outline-button.min-width-btn.export-csv-btn'),
    ).componentInstance;
    exportButton.buttonClicked.emit();
    fixture.detectChanges();
    expect(component.exportCsv).toHaveBeenCalled();
  });

  it('should trigger openPreview on preview button click', () => {
    jest.spyOn(component, 'openPreview');
    const outlineButtonComponent = fixture.debugElement.query(
      By.css('app-outline-button.min-width-btn.open-preview-btn'),
    ).componentInstance;
    outlineButtonComponent.buttonClicked.emit();
    fixture.detectChanges();
    expect(component.openPreview).toHaveBeenCalled();
  });
});
