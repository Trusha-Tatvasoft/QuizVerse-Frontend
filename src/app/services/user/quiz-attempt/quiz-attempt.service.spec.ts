import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuizAttemptService } from './quiz-attempt.service';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import {
  QuizInstructionsResponse,
  QuizQuestionResponse,
  QuizStartResponse,
  SaveAndNextQuestionRequest,
  SubmitQuizRequest,
} from '../../../pages/user/quiz-attempt-layout/interfaces/quiz-attempt.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';

describe('QuizAttemptService', () => {
  let service: QuizAttemptService;
  let httpMock: HttpTestingController;

  const mockQuizInstructions: QuizInstructionsResponse = {
    quizId: 1,
    quizName: 'Sample Quiz',
    totalTime: 30,
    totalQuestion: 10,
    quizDifficultyName: 'Medium',
    quizCategoryName: 'General Knowledge',
    isPaid: true,
    quizPrice: 100,
    description: 'A sample quiz description',
  };

  const mockQuizStartResponse: QuizStartResponse = {
    quizId: 1,
    quizQuestionId: 1,
    questionType: 'Multiple Choice',
    questionName: 'What is the capital of France?',
    options: [
      { optionId: 1, key: 'option', value: 'Paris' },
      { optionId: 2, key: 'option', value: 'London' },
      { optionId: 3, key: 'option', value: 'Berlin' },
      { optionId: 4, key: 'option', value: 'Madrid' },
    ],
    totalQuestion: 10,
    totalTime: 30,
    quizName: 'Sample Quiz',
    categoryName: 'General Knowledge',
  };

  const mockQuizQuestionResponse: QuizQuestionResponse = {
    quizQuestionId: 2,
    questionType: 'True/False',
    questionName: 'The Earth is round.',
    options: [],
  };

  const mockSaveAndNextRequest: SaveAndNextQuestionRequest = {
    quizId: 1,
    currentQuestionId: 1,
    givenAnswer: 'Paris',
    nextQuestionNumber: 2,
  };

  const mockSubmitQuizRequest: SubmitQuizRequest = {
    quizId: 1,
    quizName: 'Sample Quiz',
    timeTaken: 25,
    lastVisitedQuestionAndAnswers: {
      questionId: 1,
      givenAnswer: 'Paris',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuizAttemptService],
    });
    service = TestBed.inject(QuizAttemptService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getQuizInstructions', () => {
    it('should fetch quiz instructions successfully', () => {
      const quizId = 1;
      const mockResponse: ApiResponse<QuizInstructionsResponse> = {
        statusCode: 200,
        result: true,
        message: 'Success',
        data: mockQuizInstructions,
      };

      service.getQuizInstructions(quizId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.data.quizId).toBe(quizId);
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.getQuizInstructions}/${quizId}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching quiz instructions fails', () => {
      const quizId = 1;
      const errorMessage = 'Error fetching instructions';

      service.getQuizInstructions(quizId).subscribe({
        next: () => fail('Expected to fail'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Server Error');
        },
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.getQuizInstructions}/${quizId}`,
      );
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });

    it('should handle empty response', () => {
      const quizId = 1;

      service.getQuizInstructions(quizId).subscribe({
        next: () => fail('Expected to fail'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.getQuizInstructions}/${quizId}`,
      );
      req.flush(null, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('startQuiz', () => {
    it('should start quiz successfully', () => {
      const quizId = 1;
      const mockResponse: ApiResponse<QuizStartResponse> = {
        statusCode: 200,
        result: true,
        message: 'Quiz started successfully',
        data: mockQuizStartResponse,
      };

      service.startQuiz(quizId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.data.quizQuestionId).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.StartQuiz}/${quizId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });

    it('should handle error when starting quiz fails', () => {
      const quizId = 1;
      const errorMessage = 'Quiz already attempted';

      service.startQuiz(quizId).subscribe({
        next: () => fail('Expected to fail'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.StartQuiz}/${quizId}`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle unauthorized error', () => {
      const quizId = 1;

      service.startQuiz(quizId).subscribe({
        next: () => fail('Expected to fail'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.StartQuiz}/${quizId}`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('saveAndGetNextQuestion', () => {
    it('should save and get next question successfully', () => {
      const mockResponse: ApiResponse<QuizQuestionResponse> = {
        statusCode: 200,
        result: true,
        message: 'Question saved and next retrieved',
        data: mockQuizQuestionResponse,
      };

      service.saveAndGetNextQuestion(mockSaveAndNextRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.data.quizQuestionId).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.saveAndGetNextQuestion}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockSaveAndNextRequest);
      req.flush(mockResponse);
    });

    it('should handle error when saving and getting next question fails', () => {
      const errorMessage = 'Invalid question data';

      service.saveAndGetNextQuestion(mockSaveAndNextRequest).subscribe({
        next: () => fail('Expected to fail'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.saveAndGetNextQuestion}`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle network error', () => {
      const errorMessage = 'Network error';

      service.saveAndGetNextQuestion(mockSaveAndNextRequest).subscribe({
        next: () => fail('Expected to fail'),
        error: (error) => {
          expect(error.error).toBe(errorMessage);
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.saveAndGetNextQuestion}`);
      req.error(new ErrorEvent('Network error', { message: errorMessage }));
    });

    it('should handle empty response', () => {
      service.saveAndGetNextQuestion(mockSaveAndNextRequest).subscribe({
        next: () => fail('Expected to fail'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.saveAndGetNextQuestion}`);
      req.flush(null, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('submitQuiz', () => {
    it('should submit quiz successfully', () => {
      const mockResponse: ApiResponse<null> = {
        statusCode: 200,
        result: true,
        message: 'Quiz submitted successfully',
        data: null,
      };

      service.submitQuiz(mockSubmitQuizRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.data).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.submitQuiz}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockSubmitQuizRequest);
      req.flush(mockResponse);
    });

    it('should handle error when submitting quiz fails', () => {
      const errorMessage = 'Invalid quiz submission';

      service.submitQuiz(mockSubmitQuizRequest).subscribe({
        next: () => fail('Expected to fail'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.submitQuiz}`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle unauthorized error', () => {
      service.submitQuiz(mockSubmitQuizRequest).subscribe({
        next: () => fail('Expected to fail'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.submitQuiz}`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle network error', () => {
      const errorMessage = 'Network error';

      service.submitQuiz(mockSubmitQuizRequest).subscribe({
        next: () => fail('Expected to fail'),
        error: (error) => {
          expect(error.error).toBe(errorMessage);
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.submitQuiz}`);
      req.error(new ErrorEvent('Network error', { message: errorMessage }));
    });
  });

  describe('URL construction', () => {
    it('should construct correct URLs for all endpoints', () => {
      const quizId = 1;

      // Test getQuizInstructions URL
      service.getQuizInstructions(quizId).subscribe();
      const instructionsReq = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.getQuizInstructions}/${quizId}`,
      );
      expect(instructionsReq.request.method).toBe('GET');
      instructionsReq.flush({
        statusCode: 200,
        result: true,
        message: 'Success',
        data: mockQuizInstructions,
      });

      // Test startQuiz URL
      service.startQuiz(quizId).subscribe();
      const startReq = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.StartQuiz}/${quizId}`,
      );
      expect(startReq.request.method).toBe('POST');
      startReq.flush({
        statusCode: 200,
        result: true,
        message: 'Success',
        data: mockQuizStartResponse,
      });

      // Test saveAndGetNextQuestion URL
      service.saveAndGetNextQuestion(mockSaveAndNextRequest).subscribe();
      const saveNextReq = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.saveAndGetNextQuestion}`,
      );
      expect(saveNextReq.request.method).toBe('POST');
      saveNextReq.flush({
        statusCode: 200,
        result: true,
        message: 'Success',
        data: mockQuizQuestionResponse,
      });

      // Test submitQuiz URL
      service.submitQuiz(mockSubmitQuizRequest).subscribe();
      const submitReq = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.submitQuiz}`);
      expect(submitReq.request.method).toBe('POST');
      submitReq.flush({ statusCode: 200, result: true, message: 'Success', data: null });
    });
  });
});
