import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { QuizResultService } from './quiz-result.service';
import { environment } from '../../../../environments/environment.dev';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { QuizCompletedSummary } from '../../../pages/user/quiz-result-page/interfaces/quiz-completed-summary.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import {
  QuestionIssueReportRequest,
  QuizQuestionReview,
} from '../../../pages/user/quiz-result-page/interfaces/quiz-question-review.interface';
import { AnswerExplanationRequest } from '../../../pages/user/quiz-result-page/interfaces/answer-explaination-request.interface';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('QuizResultService (Jest)', () => {
  let service: QuizResultService;
  let httpMock: HttpTestingController;

  const baseUrl = environment.baseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuizResultService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(QuizResultService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET quiz summary', () => {
    const quizId = 1;
    const mockResponse: ApiResponse<QuizCompletedSummary> = {
      result: true,
      statusCode: 200,
      data: { totalQuestions: 10, correctAnswers: 8 } as QuizCompletedSummary,
      message: 'Loaded successfully',
    };

    service.getQuizSummary(quizId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${EndPoints.QuizCompletedSummary}/${quizId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should GET quiz question review', () => {
    const quizId = 1;
    const mockResponse: ApiResponse<QuizQuestionReview[]> = {
      result: true,
      statusCode: 200,
      data: [
        {
          questionId: 1,
          questionText: 'What is 2 + 2?',
          userAnswer: 'A',
          correctAnswer: 'B',
          isCorrect: false,
          isEditable: false,
          reportId: null,
        },
      ],
      message: 'Review loaded',
    };

    service.getQuizQuestionReview(quizId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${EndPoints.QuizQuestionReview}/${quizId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should POST answer explanation request', () => {
    const request: AnswerExplanationRequest = {
      questionText: 'What is 2 + 2?',
      correctAnswer: '4',
      userAnswer: '3',
    };

    const mockResponse: ApiResponse<string> = {
      result: true,
      statusCode: 200,
      data: 'Because 2 + 2 always equals 4',
      message: 'Success',
    };

    service.getAnswerExplanation(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${EndPoints.GetAnswerExplaination}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });

  it('should POST report question issue', () => {
    const request: QuestionIssueReportRequest = {
      quizId: 1,
      questionId: 2,
      description: 'This question is unclear',
      reportId: null,
    };
    const mockResponse: ApiResponse<any> = {
      result: true,
      statusCode: 200,
      data: { reportId: 101 },
      message: 'Reported successfully',
    };

    service.reportQuestionIssue(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${EndPoints.ReportQuestionIssue}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });

  it('should GET question report by reportId', () => {
    const reportId = 101;
    const mockResponse: ApiResponse<QuestionIssueReportRequest> = {
      result: true,
      statusCode: 200,
      data: {
        quizId: 1,
        questionId: 2,
        description: 'Reported issue details',
        reportId,
      },
      message: 'Report fetched successfully',
    };

    service.getQuestionReport(reportId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${EndPoints.GetQuestionReported}/${reportId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
