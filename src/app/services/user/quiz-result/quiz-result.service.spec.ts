import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
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
import { QuizCommentsResponse } from '../../../pages/user/quiz-result-page/interfaces/quiz-comments.interface';
import { QuizRating } from '../../../pages/user/quiz-result-page/interfaces/quiz-ratting.interface';

describe('QuizResultService (Jest)', () => {
  let service: QuizResultService;
  let httpMock: HttpTestingController;

  const baseUrl = environment.baseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuizResultService],
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

  it('should GET my quiz rating', () => {
    const quizId = 1;
    const mockResponse: ApiResponse<QuizRating | null> = {
      result: true,
      statusCode: 200,
      data: {
        quizId: 1,
        quizRating: 5,
        feedback: 'Great quiz!',
      },
      message: 'Rating loaded successfully',
    };

    service.getMyQuizRating(quizId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${EndPoints.QuizRating}/${quizId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should return null when no quiz rating exists', () => {
    const quizId = 999;
    const mockResponse: ApiResponse<QuizRating | null> = {
      result: true,
      statusCode: 200,
      data: null,
      message: 'No rating found',
    };

    service.getMyQuizRating(quizId).subscribe((res) => {
      expect(res.data).toBeNull();
      expect(res.message).toBe('No rating found');
    });

    const req = httpMock.expectOne(`${baseUrl}/${EndPoints.QuizRating}/${quizId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should POST submit quiz rating', () => {
    const request: QuizRating = {
      quizId: 1,
      quizRating: 4,
      feedback: 'Good quiz with challenging questions',
    };

    const mockResponse: ApiResponse<string> = {
      result: true,
      statusCode: 200,
      data: 'Rating submitted successfully',
      message: 'Success',
    };

    service.submitQuizRating(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${EndPoints.SubmitQuizRating}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockResponse);
  });

  // Test cases for the last two comment methods
  describe('Comments Methods', () => {
    it('should GET comments with pagination', () => {
      const quizId = 1;
      const batchNumber = 1;
      const mockResponse: ApiResponse<QuizCommentsResponse> = {
        result: true,
        statusCode: 200,
        data: {
          comments: [
            {
              userName: 'user1',
              fullName: 'John Doe',
              profilePic: 'profile1.jpg',
              commentText: 'Great quiz!',
              rating: 5,
              commentDate: new Date('2023-01-01T10:00:00Z'),
              isUser: false,
            },
            {
              userName: 'user2',
              fullName: 'Jane Smith',
              profilePic: null,
              commentText: 'Very challenging',
              rating: 4,
              commentDate: new Date('2023-01-02T11:00:00Z'),
              isUser: true,
            },
          ],
          hasMoreComments: true,
        },
        message: 'Comments loaded successfully',
      };

      service.getComments(quizId, batchNumber).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(res.data.comments.length).toBe(2);
        expect(res.data.hasMoreComments).toBe(true);
        expect(res.data.comments[0].userName).toBe('user1');
        expect(res.data.comments[1].isUser).toBe(true);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/${EndPoints.QuizComments}/${quizId}/${batchNumber}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty comments response', () => {
      const quizId = 2;
      const batchNumber = 1;
      const mockResponse: ApiResponse<QuizCommentsResponse> = {
        result: true,
        statusCode: 200,
        data: {
          comments: [],
          hasMoreComments: false,
        },
        message: 'No comments found',
      };

      service.getComments(quizId, batchNumber).subscribe((res) => {
        expect(res.data.comments.length).toBe(0);
        expect(res.data.hasMoreComments).toBe(false);
        expect(res.message).toBe('No comments found');
      });

      const req = httpMock.expectOne(
        `${baseUrl}/${EndPoints.QuizComments}/${quizId}/${batchNumber}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET total comments count', () => {
      const quizId = 1;
      const mockResponse: ApiResponse<number> = {
        result: true,
        statusCode: 200,
        data: 15,
        message: 'Total comments count retrieved',
      };

      service.getTotalComments(quizId).subscribe((res) => {
        expect(res.data).toBe(15);
        expect(res.message).toBe('Total comments count retrieved');
      });

      const req = httpMock.expectOne(`${baseUrl}/${EndPoints.TotalQuizComments}/${quizId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle zero total comments', () => {
      const quizId = 3;
      const mockResponse: ApiResponse<number> = {
        result: true,
        statusCode: 200,
        data: 0,
        message: 'No comments available',
      };

      service.getTotalComments(quizId).subscribe((res) => {
        expect(res.data).toBe(0);
        expect(res.message).toBe('No comments available');
      });

      const req = httpMock.expectOne(`${baseUrl}/${EndPoints.TotalQuizComments}/${quizId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should use correct URL pattern for getComments', () => {
      const quizId = 5;
      const batchNumber = 3;

      service.getComments(quizId, batchNumber).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${EndPoints.QuizComments}/${quizId}/${batchNumber}`,
      );
      expect(req.request.method).toBe('GET');

      req.flush({
        result: true,
        statusCode: 200,
        data: { comments: [], hasMoreComments: false },
        message: 'Success',
      });
    });

    it('should use correct URL pattern for getTotalComments', () => {
      const quizId = 7;

      service.getTotalComments(quizId).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${EndPoints.TotalQuizComments}/${quizId}`);
      expect(req.request.method).toBe('GET');

      req.flush({
        result: true,
        statusCode: 200,
        data: 10,
        message: 'Success',
      });
    });

    it('should handle error response for getComments', () => {
      const quizId = 1;
      const batchNumber = 1;
      const mockErrorResponse: ApiResponse<QuizCommentsResponse> = {
        result: false,
        statusCode: 404,
        data: { comments: [], hasMoreComments: false },
        message: 'Quiz not found',
      };

      service.getComments(quizId, batchNumber).subscribe((res) => {
        expect(res.result).toBe(false);
        expect(res.statusCode).toBe(404);
        expect(res.message).toBe('Quiz not found');
      });

      const req = httpMock.expectOne(
        `${baseUrl}/${EndPoints.QuizComments}/${quizId}/${batchNumber}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockErrorResponse);
    });

    it('should handle error response for getTotalComments', () => {
      const quizId = 999;
      const mockErrorResponse: ApiResponse<number> = {
        result: false,
        statusCode: 500,
        data: 0,
        message: 'Internal server error',
      };

      service.getTotalComments(quizId).subscribe((res) => {
        expect(res.result).toBe(false);
        expect(res.statusCode).toBe(500);
        expect(res.message).toBe('Internal server error');
      });

      const req = httpMock.expectOne(`${baseUrl}/${EndPoints.TotalQuizComments}/${quizId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockErrorResponse);
    });
  });
});
