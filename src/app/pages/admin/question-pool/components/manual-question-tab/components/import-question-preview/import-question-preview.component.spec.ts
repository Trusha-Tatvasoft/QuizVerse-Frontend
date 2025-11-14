import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportQuestionPreviewComponent } from './import-question-preview.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FilledButtonComponent } from '../../../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../../../shared/components/outline-button/outline-button.component';
import { QuestionPoolService } from '../../../../../../../services/admin/question-pool/question-pool.service';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../../../../utils/constants';
import { of, throwError } from 'rxjs';
import {
  QuestionPoolListData,
  QueOptionsAndAns,
} from '../../../../interfaces/question-pool-list-data.interface';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ImportPreviewDialogData } from '../../../../interfaces/question-pool-ai-tab.interface';

describe('ImportQuestionPreviewComponent', () => {
  let component: ImportQuestionPreviewComponent;
  let fixture: ComponentFixture<ImportQuestionPreviewComponent>;

  const mockQuestions: QuestionPoolListData[] = [
    {
      id: 1,
      categoryId: 101,
      categoryName: 'Math',
      queDifficultyId: 1,
      queDifficultyName: 'Easy',
      queText: 'What is 2 + 2?',
      queTypeId: 1,
      queTypeName: 'MCQ',
      queOptionsAns: [
        { id: 1, questionId: 1, key: 'option', value: '3' },
        { id: 2, questionId: 1, key: 'option', value: '4' },
        { id: 3, questionId: 1, key: 'answer', value: '4' },
      ],
    },
  ];

  const mockDialogData: ImportPreviewDialogData = {
    questions: mockQuestions,
    isFromQuizCreation: false,
  };

  const dialogRefMock = {
    close: jest.fn(),
  };

  const questionPoolServiceMock = {
    saveQuestions: jest.fn(),
  };

  const snackbarMock = {
    showError: jest.fn(),
    showSuccess: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        FilledButtonComponent,
        OutlineButtonComponent,
        ImportQuestionPreviewComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: QuestionPoolService, useValue: questionPoolServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportQuestionPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    jest.clearAllMocks();
  });

  it('should create the component and initialize questions and isFromQuizCreation', () => {
    expect(component).toBeTruthy();
    expect(component.questions.length).toBe(1);
    expect(component.questions[0].queText).toBe('What is 2 + 2?');
    expect(component.isFromQuizCreation).toBe(false);
  });

  it('should initialize with isFromQuizCreation as true when provided in data', () => {
    const quizCreationData: ImportPreviewDialogData = {
      questions: mockQuestions,
      isFromQuizCreation: true,
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        FilledButtonComponent,
        OutlineButtonComponent,
        ImportQuestionPreviewComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: quizCreationData },
        { provide: QuestionPoolService, useValue: questionPoolServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    const quizCreationFixture = TestBed.createComponent(ImportQuestionPreviewComponent);
    const quizCreationComponent = quizCreationFixture.componentInstance;
    quizCreationFixture.detectChanges();

    expect(quizCreationComponent.isFromQuizCreation).toBe(true);
  });

  it('should remove a question by index', () => {
    component.removeQuestion(0);
    expect(component.questions.length).toBe(0);
  });

  describe('addQuestions()', () => {
    describe('when no questions are present', () => {
      it('should show error and close dialog', () => {
        component.questions = [];
        component.addQuestions();

        expect(snackbarMock.showError).toHaveBeenCalledWith(
          platformMessages.errorTitle,
          platformMessages.noQuestionsToSave,
        );
        expect(dialogRefMock.close).toHaveBeenCalled();
      });
    });

    describe('when isFromQuizCreation is false (from Question Pool)', () => {
      beforeEach(() => {
        component.isFromQuizCreation = false;
      });

      it('should call saveQuestions and close dialog with true on success', () => {
        questionPoolServiceMock.saveQuestions.mockReturnValue(of({}));

        component.addQuestions();

        expect(questionPoolServiceMock.saveQuestions).toHaveBeenCalledWith(mockQuestions);
        expect(snackbarMock.showSuccess).toHaveBeenCalledWith(
          platformMessages.successTitle,
          platformMessages.saveQuestionsSuccess,
        );
        expect(dialogRefMock.close).toHaveBeenCalledWith(true);
      });

      it('should show error if saveQuestions fails', () => {
        const errorResponse = {
          error: { message: 'Save failed' },
          status: 500,
        };

        questionPoolServiceMock.saveQuestions.mockReturnValue(throwError(() => errorResponse));

        component.addQuestions();

        expect(snackbarMock.showError).toHaveBeenCalledWith(
          platformMessages.errorTitle,
          'Save failed',
        );
        expect(dialogRefMock.close).not.toHaveBeenCalledWith(true);
      });

      it('should show default error message if saveQuestions fails without error message', () => {
        const errorResponse = {
          error: {},
          status: 500,
        };

        questionPoolServiceMock.saveQuestions.mockReturnValue(throwError(() => errorResponse));

        component.addQuestions();

        expect(snackbarMock.showError).toHaveBeenCalledWith(
          platformMessages.errorTitle,
          platformMessages.saveQuestionsFailure,
        );
        expect(dialogRefMock.close).not.toHaveBeenCalledWith(true);
      });
    });

    describe('when isFromQuizCreation is true (from Quiz Creation)', () => {
      beforeEach(() => {
        component.isFromQuizCreation = true;
      });

      it('should close dialog with questions data without calling service', () => {
        component.addQuestions();

        expect(questionPoolServiceMock.saveQuestions).not.toHaveBeenCalled();
        expect(snackbarMock.showSuccess).not.toHaveBeenCalled();
        expect(snackbarMock.showError).not.toHaveBeenCalled();
        expect(dialogRefMock.close).toHaveBeenCalledWith(mockQuestions);
      });

      it('should close with empty array when questions are empty (edge case)', () => {
        component.questions = [];
        component.isFromQuizCreation = true;

        component.addQuestions();

        expect(snackbarMock.showError).toHaveBeenCalledWith(
          platformMessages.errorTitle,
          platformMessages.noQuestionsToSave,
        );
        expect(dialogRefMock.close).toHaveBeenCalled();
      });
    });
  });

  describe('hasOptions()', () => {
    it('should return true when queOptionsAns contain key "option"', () => {
      const result = component.hasOptions(mockQuestions[0].queOptionsAns);
      expect(result).toBe(true);
    });

    it('should return false when queOptionsAns contains no options', () => {
      const result = component.hasOptions([{ id: 1, questionId: 1, key: 'answer', value: '4' }]);
      expect(result).toBe(false);
    });

    it('should return false when queOptionsAns is null or undefined', () => {
      expect(component.hasOptions(null)).toBe(false);
      expect(component.hasOptions(undefined)).toBe(false);
    });
  });

  describe('getOptionsString()', () => {
    it('should return comma-separated options string', () => {
      const options: QueOptionsAndAns[] = [
        { id: 1, questionId: 1, key: 'option', value: 'Option A' },
        { id: 2, questionId: 1, key: 'option', value: 'Option B' },
        { id: 3, questionId: 1, key: 'answer', value: 'Option B' },
      ];

      const result = component.getOptionsString(options);
      expect(result).toBe('Option A, Option B');
    });
  });

  describe('getAnswerString()', () => {
    it('should return comma-separated answer string', () => {
      const options: QueOptionsAndAns[] = [
        { id: 1, questionId: 1, key: 'option', value: 'Wrong' },
        { id: 2, questionId: 1, key: 'answer', value: 'Correct A' },
        { id: 3, questionId: 1, key: 'answer', value: 'Correct B' },
      ];

      const result = component.getAnswerString(options);
      expect(result).toBe('Correct A, Correct B');
    });
  });

  it('should close dialog when closeDialog is called', () => {
    component.closeDialog();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });
});
