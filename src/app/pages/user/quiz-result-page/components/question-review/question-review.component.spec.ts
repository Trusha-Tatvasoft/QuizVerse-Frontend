import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { QuestionReviewComponent } from './question-review.component';
import { QuizResultService } from '../../../../../services/user/quiz-result.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../../utils/constants';
import { QuizQuestionReviewExtended } from '../../interfaces/quiz-question-review.interface';
import { ReportQuestionDialogComponent } from '../report-question-dialog/report-question-dialog.component';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';

describe('QuestionReviewComponent', () => {
  let component: QuestionReviewComponent;
  let fixture: ComponentFixture<QuestionReviewComponent>;

  let quizServiceMock: jest.Mocked<QuizResultService>;
  let snackBarMock: jest.Mocked<SnackbarService>;
  let dialogMock: jest.Mocked<MatDialog>;

  beforeEach(async () => {
    quizServiceMock = {
      getQuizQuestionReview: jest.fn(),
      getAnswerExplanation: jest.fn(),
      reportQuestionIssue: jest.fn(),
    } as any;

    snackBarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as any;

    dialogMock = {
      open: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [QuestionReviewComponent],
      providers: [
        { provide: QuizResultService, useValue: quizServiceMock },
        { provide: SnackbarService, useValue: snackBarMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionReviewComponent);
    component = fixture.componentInstance;
    component.quizId = 123;
  });

  describe('ngOnInit', () => {
    it('should load questions if quizId is provided', () => {
      const mockData: QuizQuestionReviewExtended[] = [
        {
          questionId: 1,
          questionText: 'Q1',
          correctAnswer: 'A',
          userAnswer: 'A',
          isCorrect: true,
        } as any,
      ];
      quizServiceMock.getQuizQuestionReview.mockReturnValue(
        of({
          result: true,
          data: mockData,
          statusCode: 200,
          message: 'Fetched successfully',
        } as ApiResponse<QuizQuestionReviewExtended[]>),
      );

      fixture.detectChanges();

      expect(quizServiceMock.getQuizQuestionReview).toHaveBeenCalledWith(123);
      expect(component.questions.length).toBe(1);
      expect(component.questions[0].loadingExplanation).toBe(false);
    });

    it('should show error snackbar if quizId not provided', () => {
      component.quizId = undefined as any;
      component.ngOnInit();

      expect(snackBarMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.failedToFatchQuestions,
      );
    });

    it('should show error snackbar when service fails', () => {
      quizServiceMock.getQuizQuestionReview.mockReturnValue(throwError(() => 'error'));

      fixture.detectChanges();

      expect(snackBarMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.failedLoadQuesPreview,
      );
    });
  });

  describe('fetchExplanation', () => {
    let question: QuizQuestionReviewExtended;

    beforeEach(() => {
      question = {
        questionId: 1,
        questionText: 'Q1',
        correctAnswer: 'A',
        userAnswer: 'B',
        isCorrect: false,
        showExplanation: false,
        loadingExplanation: false,
      } as any;
    });

    it('should toggle showExplanation if explanation already exists', () => {
      question.explanation = 'Existing explanation';
      component.fetchExplanation(question);

      expect(question.showExplanation).toBe(true);
    });

    it('should fetch explanation successfully', () => {
      quizServiceMock.getAnswerExplanation.mockReturnValue(
        of({
          result: true,
          data: 'Some explanation',
          statusCode: 200,
          message: 'OK',
        } as ApiResponse<string>),
      );

      component.fetchExplanation(question);

      expect(quizServiceMock.getAnswerExplanation).toHaveBeenCalledWith({
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        userAnswer: question.userAnswer,
      });
      expect(question.explanation).toBe('Some explanation');
      expect(question.showExplanation).toBe(true);
      expect(question.loadingExplanation).toBe(false);
    });

    it('should handle error while fetching explanation', () => {
      quizServiceMock.getAnswerExplanation.mockReturnValue(throwError(() => 'error'));

      component.fetchExplanation(question);

      expect(question.explanation).toBe('Failed to load explanation.');
      expect(question.loadingExplanation).toBe(false);
      expect(snackBarMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.failedLoadQuizExplaination,
      );
    });
  });

  describe('openReportDialog', () => {
    it('should open dialog and call report service on success', () => {
      const dialogRefMock = {
        componentInstance: {
          questionId: undefined,
          questionText: undefined,
        },
        afterClosed: jest.fn().mockReturnValue(of({ questionId: 1, description: 'Bad wording' })),
      };
      dialogMock.open.mockReturnValue(dialogRefMock as any);

      quizServiceMock.reportQuestionIssue.mockReturnValue(
        of({
          result: true,
          data: null,
          statusCode: 200,
          message: 'Reported successfully',
        } as unknown as ApiResponse<string>),
      );

      const question = {
        questionId: 1,
        questionText: 'Q1',
      } as QuizQuestionReviewExtended;

      component.openReportDialog(question);

      expect(dialogMock.open).toHaveBeenCalledWith(ReportQuestionDialogComponent, {
        width: '500px',
      });
      expect(dialogRefMock.componentInstance.questionId).toBe(1);
      expect(dialogRefMock.componentInstance.questionText).toBe('Q1');
      expect(quizServiceMock.reportQuestionIssue).toHaveBeenCalledWith({
        quizId: 123,
        questionId: 1,
        description: 'Bad wording',
      });
      expect(snackBarMock.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        'Reported successfully',
      );
    });

    it('should show error snackbar if reportQuestionIssue fails', () => {
      const dialogRefMock = {
        componentInstance: {},
        afterClosed: jest.fn().mockReturnValue(of({ questionId: 1, description: 'Bad wording' })),
      };
      dialogMock.open.mockReturnValue(dialogRefMock as any);

      quizServiceMock.reportQuestionIssue.mockReturnValue(throwError(() => 'error'));

      component.openReportDialog({ questionId: 1, questionText: 'Q1' } as any);

      expect(snackBarMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.errorMessage,
      );
    });

    it('should do nothing if dialog result is falsy', () => {
      const dialogRefMock = {
        componentInstance: {},
        afterClosed: jest.fn().mockReturnValue(of(null)),
      };
      dialogMock.open.mockReturnValue(dialogRefMock as any);

      component.openReportDialog({ questionId: 1, questionText: 'Q1' } as any);

      expect(quizServiceMock.reportQuestionIssue).not.toHaveBeenCalled();
    });
  });
});
