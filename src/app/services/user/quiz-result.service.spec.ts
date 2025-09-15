import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuizResultService } from './quiz-result.service';
import { environment } from '../../../environments/environment.dev';
import { EndPoints } from '../../shared/enums/end-point.enum';
import { QuizCompletedSummary } from '../../pages/user/quiz-result-page/interfaces/quiz-completed-summary.interface';
import { QuizQuestionReview } from '../../pages/user/quiz-result-page/interfaces/quiz-question-review.interface';
import { AnswerExplanationRequest } from '../../pages/user/quiz-result-page/interfaces/answer-explaination-request.interface';
import { ApiResponse } from '../../shared/interfaces/api-response.interface';

describe('QuizResultService', () => {
  let service: QuizResultService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuizResultService],
    });

    service = TestBed.inject(QuizResultService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch quiz summary', () => {
    const quizId = 123;
    const mockResponse: ApiResponse<QuizCompletedSummary> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: {
        quizName: 'Sample Quiz',
        totalQuestions: 10,
        correctAnswers: 7,
        wrongAnswers: 3,
        scorePercentage: 70,
        grade: 'B',
        timeSpent: '00:12:34',
        xpEarned: 150,
      } as QuizCompletedSummary,
    };
    service.getQuizSummary(quizId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.QuizCompletedSummary}/${quizId}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch quiz question review', () => {
    const quizId = 123;
    const mockResponse: ApiResponse<QuizQuestionReview[]> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: [
        { questionId: 1, questionText: 'Q1', correctAnswer: 'A' },
        { questionId: 2, questionText: 'Q2', correctAnswer: 'B' },
      ] as QuizQuestionReview[],
    };

    service.getQuizQuestionReview(quizId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.QuizQuestionReview}/${quizId}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should post answer explanation request', () => {
    const request: AnswerExplanationRequest = {
      QuestionText: 'Sample question',
      UserAnswer: 'A',
      CorrectAnswer: 'B',
    };

    const mockResponse: ApiResponse<string> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: 'Explanation text',
    };

    service.getAnswerExplanation(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });
});
