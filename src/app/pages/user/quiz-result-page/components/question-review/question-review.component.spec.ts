import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { QuestionReviewComponent } from './question-review.component';
import { QuizResultService } from '../../../../../services/user/quiz-result/quiz-result.service';
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
      getQuestionReport: jest.fn(),
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
        platformMessages.errorMessage,
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
    const mockDialogRef = (result: any) => ({
      afterClosed: jest.fn().mockReturnValue(of(result)),
    });

    it('should open dialog directly when reportId is null', () => {
      const question = { questionId: 1, questionText: 'Q1', reportId: null } as any;
      const dialogRef = mockDialogRef({ questionId: 1, description: 'Desc' });
      dialogMock.open.mockReturnValue(dialogRef as any);

      quizServiceMock.reportQuestionIssue.mockReturnValue(
        of({ result: true, statusCode: 200, message: 'Reported', data: null }),
      );

      component.openReportDialog(question);

      expect(dialogMock.open).toHaveBeenCalledWith(
        ReportQuestionDialogComponent,
        expect.any(Object),
      );
      expect(quizServiceMock.reportQuestionIssue).toHaveBeenCalled();
      expect(snackBarMock.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        'Reported',
      );
    });

    it('should fetch report details and open dialog (success path)', () => {
      const question = {
        questionId: 1,
        questionText: 'Q1',
        reportId: 100,
        isEditable: true,
      } as any;
      quizServiceMock.getQuestionReport.mockReturnValue(
        of({
          result: true,
          data: { description: 'Existing issue', quizId: 1, questionId: 1, reportId: 100 },
          statusCode: 200,
          message: 'OK',
        }),
      );
      const dialogRef = mockDialogRef({ questionId: 1, description: 'Updated desc' });
      dialogMock.open.mockReturnValue(dialogRef as any);
      quizServiceMock.reportQuestionIssue.mockReturnValue(
        of({ result: true, message: 'Reported successfully', statusCode: 200, data: null }),
      );

      component.openReportDialog(question);

      expect(quizServiceMock.getQuestionReport).toHaveBeenCalledWith(100);
      expect(dialogMock.open).toHaveBeenCalled();
      expect(snackBarMock.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        'Reported successfully',
      );
    });

    it('should handle error when fetching report details and still open dialog', () => {
      const question = { questionId: 1, questionText: 'Q1', reportId: 101 } as any;
      quizServiceMock.getQuestionReport.mockReturnValue(
        throwError(() => ({ error: { message: 'Failed' } })),
      );
      const dialogRef = mockDialogRef({ questionId: 1, description: 'Retry' });
      dialogMock.open.mockReturnValue(dialogRef as any);
      quizServiceMock.reportQuestionIssue.mockReturnValue(
        of({ result: true, message: 'Reported successfully', statusCode: 200, data: null }),
      );

      component.openReportDialog(question);

      expect(snackBarMock.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'Failed');
      expect(dialogMock.open).toHaveBeenCalled();
    });

    it('should show snackbar when reportQuestionIssue fails', () => {
      const question = { questionId: 1, questionText: 'Q1', reportId: null } as any;
      const dialogRef = mockDialogRef({ questionId: 1, description: 'Bad wording' });
      dialogMock.open.mockReturnValue(dialogRef as any);
      quizServiceMock.reportQuestionIssue.mockReturnValue(
        throwError(() => ({ error: { message: 'Server Error' } })),
      );

      component.openReportDialog(question);

      expect(snackBarMock.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        'Server Error',
      );
    });

    it('should do nothing if dialog result is falsy', () => {
      const question = { questionId: 1, questionText: 'Q1', reportId: null } as any;
      const dialogRef = mockDialogRef(null);
      dialogMock.open.mockReturnValue(dialogRef as any);

      component.openReportDialog(question);

      expect(quizServiceMock.reportQuestionIssue).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const completeSpy = jest.spyOn<any, any>(component['destroy$'], 'complete');
      const nextSpy = jest.spyOn<any, any>(component['destroy$'], 'next');
      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
