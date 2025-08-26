import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCreationStep4Component } from './quiz-creation-step-4.component';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import * as utils from '../../../../../utils/quiz-crud-common-functions.utils';

describe('QuizCreationStep4Component (Jest)', () => {
  let component: QuizCreationStep4Component;
  let fixture: ComponentFixture<QuizCreationStep4Component>;

  let mockDialog: { open: jest.Mock };
  let mockSnackbar: { showError: jest.Mock };
  let mockQuizCreationService: { exportCsv: jest.Mock };

  beforeEach(async () => {
    mockDialog = { open: jest.fn() };
    mockSnackbar = { showError: jest.fn() };
    mockQuizCreationService = { exportCsv: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [QuizCreationStep4Component],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: QuizCreationService, useValue: mockQuizCreationService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep4Component);
    component = fixture.componentInstance;

    // Default inputs
    component.quizStep1Data = {
      quizTitle: 'Sample Quiz',
      quizCategory: 1,
      quizCategoryName: 'Science',
      description: 'Sample description',
      quizTiming: 30,
      isPaid: false,
      price: 0,
      tags: ['tag1'],
      difficultyDistribution: [
        { key: 'easyQuestions', value: 2 },
        { key: 'hardQuestions', value: 1 },
      ],
      totalQuestions: 3,
      difficultyLevel: 2,
      easyQuestions: 2,
      mediumQuestions: 1,
    } as any;

    component.selectedQuestions = [
      {
        id: 1,
        queText: 'What is 2+2?',
        queTypeId: 1,
        queTypeName: 'Multiple Choice',
        queDifficultyId: 1,
        queDifficultyName: 'Easy',
        categoryId: 10,
        queOptionsAns: [
          { key: 'option', value: '4' },
          { key: 'answer', value: '4' },
        ],
      },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('totalQuestions', () => {
    it('should calculate totalQuestions correctly', () => {
      const result = component.totalQuestions(component.quizStep1Data);
      expect(result).toBe(3);
    });

    it('should return 0 if no difficulty fields present', () => {
      const result = component.totalQuestions({} as any);
      expect(result).toBe(0);
    });

    it('should handle non-numeric difficulty fields', () => {
      const data = {
        easyQuestions: 'invalid',
        mediumQuestions: null,
        hardQuestions: undefined,
      } as any;
      const result = component.totalQuestions(data);
      expect(result).toBe(0);
    });

    it('should handle partial numeric fields', () => {
      const data = {
        easyQuestions: 2,
        mediumQuestions: 'invalid',
        hardQuestions: 3,
      } as any;
      const result = component.totalQuestions(data);
      expect(result).toBe(5);
    });
  });

  describe('getMCQOptions', () => {
    it('should return options if queOptionsAns present', () => {
      const result = component.getMCQOptions(component.selectedQuestions[0]);
      expect(result).toBe('4');
    });

    it('should return empty string if queOptionsAns is null', () => {
      const result = component.getMCQOptions({ queOptionsAns: null } as any);
      expect(result).toBe('');
    });

    it('should return empty string if queOptionsAns is undefined', () => {
      const result = component.getMCQOptions({} as any);
      expect(result).toBe('');
    });

    it('should return empty string if no options with key "option"', () => {
      const question = {
        queOptionsAns: [{ key: 'answer', value: '4' }],
      } as any;
      const result = component.getMCQOptions(question);
      expect(result).toBe('');
    });
  });

  describe('getAnswer', () => {
    it('should return answer if present', () => {
      const result = component.getAnswer(component.selectedQuestions[0]);
      expect(result).toBe('4');
    });

    it('should return empty string if queOptionsAns is null', () => {
      const result = component.getAnswer({ queOptionsAns: null } as any);
      expect(result).toBe('');
    });

    it('should return empty string if queOptionsAns is undefined', () => {
      const result = component.getAnswer({} as any);
      expect(result).toBe('');
    });

    it('should return empty string if no answer key present', () => {
      const question = {
        queOptionsAns: [{ key: 'option', value: '4' }],
      } as any;
      const result = component.getAnswer(question);
      expect(result).toBe('');
    });
  });

  describe('openPreview', () => {
    it('should not open dialog if quizStep1Data is missing', () => {
      component.quizStep1Data = null as any;
      component.openPreview();
      expect(mockDialog.open).not.toHaveBeenCalled();
    });

    it('should open dialog with correct data', () => {
      jest
        .spyOn(utils, 'getTagConfigWithCustomization')
        .mockReturnValue({ label: 'Science' } as any);
      component.openPreview();
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          data: expect.objectContaining({
            quizName: 'Sample Quiz',
            description: 'Sample description',
            tags: expect.arrayContaining([
              { label: 'Science' },
              expect.any(Object),
              expect.any(Object),
            ]),
            questions: component.selectedQuestions,
          }),
        }),
      );
    });

    it('should handle missing quizTiming', () => {
      component.quizStep1Data = { ...component.quizStep1Data, quizTiming: undefined } as any;
      jest.spyOn(utils, 'getTagConfigWithCustomization').mockReturnValue({ label: '' } as any);
      component.openPreview();
      expect(mockDialog.open).toHaveBeenCalled();
      expect(utils.getTagConfigWithCustomization).toHaveBeenCalledWith('undefined minutes', true);
    });
  });

  describe('exportCsv', () => {
    it('should show error if quizTitle is missing', () => {
      component.quizStep1Data.quizTitle = '';
      component.exportCsv();
      expect(mockSnackbar.showError).toHaveBeenCalledWith('Quiz name not found');
    });

    it('should show error if quizStep1Data is null', () => {
      component.quizStep1Data = null as any;
      component.exportCsv();
      expect(mockSnackbar.showError).toHaveBeenCalledWith('Quiz name not found');
    });

    it('should show error if quizTitle is undefined', () => {
      component.quizStep1Data = { ...component.quizStep1Data, quizTitle: undefined } as any;
      component.exportCsv();
      expect(mockSnackbar.showError).toHaveBeenCalledWith('Quiz name not found');
    });

    it('should handle empty selectedQuestions', () => {
      component.selectedQuestions = [];
      const blob = new Blob(['test'], { type: 'text/csv' });
      mockQuizCreationService.exportCsv.mockReturnValue(of(blob));
      const createObjectURLMock = jest.fn().mockReturnValue('blob:url');
      global.URL.createObjectURL = createObjectURLMock;
      const clickMock = jest.fn();
      const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(
        () =>
          ({
            href: '',
            download: '',
            click: clickMock,
          }) as any,
      );

      component.exportCsv();

      expect(mockQuizCreationService.exportCsv).toHaveBeenCalledWith({
        quizName: 'Sample Quiz',
        questions: [],
      });
      createElementSpy.mockRestore();
    });

    it('should handle incomplete question data', () => {
      component.selectedQuestions = [
        {
          id: 1,
          queText: 'What is 2+2?',
          queTypeId: undefined, // Missing queTypeId
          queDifficultyId: undefined, // Missing queDifficultyId
          categoryId: undefined,
          queOptionsAns: [],
        },
      ];
      const blob = new Blob(['test'], { type: 'text/csv' });
      mockQuizCreationService.exportCsv.mockReturnValue(of(blob));
      const createObjectURLMock = jest.fn().mockReturnValue('blob:url');
      global.URL.createObjectURL = createObjectURLMock;
      const clickMock = jest.fn();
      const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(
        () =>
          ({
            href: '',
            download: '',
            click: clickMock,
          }) as any,
      );

      component.exportCsv();

      expect(mockQuizCreationService.exportCsv).toHaveBeenCalledWith({
        quizName: 'Sample Quiz',
        questions: [
          {
            id: 1,
            categoryId: 1, // Falls back to quizStep1Data.quizCategory
            queDifficultyId: undefined,
            queText: 'What is 2+2?',
            queTypeId: undefined,
            queOptionsAns: [],
          },
        ],
      });
      createElementSpy.mockRestore();
    });

    it('should download file on success', () => {
      const blob = new Blob(['test'], { type: 'text/csv' });
      mockQuizCreationService.exportCsv.mockReturnValue(of(blob));
      const createObjectURLMock = jest.fn().mockReturnValue('blob:url');
      const revokeObjectURLMock = jest.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;
      const clickMock = jest.fn();
      const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(
        () =>
          ({
            href: '',
            download: '',
            click: clickMock,
          }) as any,
      );

      component.exportCsv();

      expect(mockQuizCreationService.exportCsv).toHaveBeenCalled();
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalled();
      createElementSpy.mockRestore();
    });

    it('should show error on failure', () => {
      mockQuizCreationService.exportCsv.mockReturnValue(throwError(() => new Error('fail')));
      component.exportCsv();
      expect(mockSnackbar.showError).toHaveBeenCalledWith('Failed to export questions.');
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
      component.ngOnDestroy();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should call destroy$.next before complete', () => {
      const nextSpy = jest.spyOn((component as any).destroy$, 'next');
      const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalledWith();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Utility functions', () => {
    it('should call getTypeTagConfigWithLabel correctly', () => {
      const spy = jest
        .spyOn(utils, 'getTypeTagConfigWithLabel')
        .mockReturnValue({ label: 'MCQ' } as any);
      const result = component.getTypeTagConfigWithLabelInCS('Multiple Choice');
      expect(spy).toHaveBeenCalledWith('Multiple Choice');
      expect(result).toEqual({ label: 'MCQ' });
    });
  });
});
