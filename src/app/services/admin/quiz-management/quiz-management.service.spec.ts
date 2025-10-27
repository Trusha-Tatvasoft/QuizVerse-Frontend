import { TestBed } from '@angular/core/testing';

import { QuizManagementService } from './quiz-management.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { QuizManagementSummary } from '../../../pages/admin/quiz-management/interfaces/quiz-management-summary.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { QuizListData } from '../../../pages/admin/quiz-management/interfaces/quiz-table-data.interface';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { platformMessages } from '../../../utils/constants';
import { UserAction } from '../../../shared/enums/user-management.enum';

describe('QuizManagementService', () => {
  let service: QuizManagementService;
  let httpMock: HttpTestingController;

  const mockResponse: ApiResponse<QuizManagementSummary> = {
    result: true,
    statusCode: 200,
    message: 'Stats retrieved successfully',
    data: {
      totalQuiz: 10,
      totalParticipants: 10,
      activeQuiz: 8,
      totalQuestions: 2,
    } as QuizManagementSummary,
  };

  const mockQuizListResponse: ApiResponse<PaginatedDataResponse<QuizListData>> = {
    result: true,
    message: 'Data fetched successfully',
    statusCode: 200,
    data: {
      totalRecords: 2,
      records: [
        {
          id: 9,
          quizTitle: 'Gk Quizes',
          categoryName: 'Technology',
          quizDifficultyLevel: 'Medium',
          totalQuestion: 10,
          noOfPersonAttempted: 0,
          status: 1,
          createdDate: '2025-08-11T18:12:11.32978',
        },
        {
          id: 6,
          quizTitle: 'Science Quiz Battle',
          categoryName: 'Technology',
          quizDifficultyLevel: 'Medium',
          totalQuestion: 1,
          noOfPersonAttempted: 0,
          status: 1,
          createdDate: '2025-07-24T13:15:18.395431',
        },
      ],
    },
  };

  const request: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: 'Quiz',
    sortColumn: 'quizTitle',
    sortDescending: false,
    filters: { status: 1 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuizManagementService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuizManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getQuizManagementStats', () => {
    it('should call the correct endpoint with empty body and return data', () => {
      service.getQuizManagementStats().subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(res.result).toBe(true);
        expect(res.data.totalQuiz).toBe(10);
        expect(res.data.totalParticipants).toBe(10);
        expect(res.data.activeQuiz).toBe(8);
        expect(res.data.totalQuestions).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.QuizManagementStats}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should propagate error when backend fails', () => {
      const errorMsg = 'Internal Server Error';

      service.getQuizManagementStats().subscribe({
        next: () => fail('Expected error, not success'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Server Error');
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.QuizManagementStats}`);
      expect(req.request.method).toBe('GET');

      req.flush(errorMsg, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getQuizzes', () => {
    it('should call the correct endpoint with request body and return quizzes', () => {
      service.getQuizzes(request).subscribe((res) => {
        expect(res).toEqual(mockQuizListResponse);
        expect(res.result).toBe(true);
        expect(res.message).toBe('Data fetched successfully');
        expect(res.data.totalRecords).toBe(2);

        expect(res.data.records[0].quizTitle).toBe('Gk Quizes');
        expect(res.data.records[0].quizDifficultyLevel).toBe('Medium');
        expect(res.data.records[0].totalQuestion).toBe(10);

        expect(res.data.records[1].quizTitle).toBe('Science Quiz Battle');
        expect(res.data.records[1].status).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.QuizTableData}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);

      req.flush(mockQuizListResponse);
    });

    it('should handle backend error correctly', () => {
      const errorMsg = 'Database unavailable';

      service.getQuizzes(request).subscribe({
        next: () => fail('Expected error, not success'),
        error: (error) => {
          expect(error.status).toBe(503);
          expect(error.statusText).toBe('Service Unavailable');
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.QuizTableData}`);
      expect(req.request.method).toBe('POST');

      req.flush(errorMsg, { status: 503, statusText: 'Service Unavailable' });
    });
  });

  describe('updateQuizAction', () => {
    const mockPayload = {
      id: 123,
      action: UserAction.Delete,
      newStatus: undefined,
    };

    const mockSuccessResponse: ApiResponse<object> = {
      result: true,
      statusCode: 200,
      message: platformMessages.deleteQuizSuccess,
      data: {},
    };

    it('should call PUT on the correct endpoint with correct payload and return success response', () => {
      service.updateQuizAction(mockPayload).subscribe((res) => {
        expect(res).toEqual(mockSuccessResponse);
        expect(res.result).toBe(true);
        expect(res.statusCode).toBe(200);
        expect(res.message).toBe(platformMessages.deleteQuizSuccess);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UpdateQuizAction}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockPayload);
      req.flush(mockSuccessResponse);
    });

    it('should propagate error when backend update fails', () => {
      const errorMsg = 'Quiz not found';

      service.updateQuizAction(mockPayload).subscribe({
        next: () => fail('Expected error, not success'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UpdateQuizAction}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockPayload);

      req.flush(errorMsg, { status: 404, statusText: 'Not Found' });
    });
  });
});
