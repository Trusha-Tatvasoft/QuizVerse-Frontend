import { TestBed } from '@angular/core/testing';

import { QuizManagementService } from './quiz-management.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { QuizManagementSummary } from '../../../pages/admin/quiz-management/interfaces/quiz-management-summary.interface';

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
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
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
      expect(req.request.method).toBe('POST');

      req.flush(errorMsg, { status: 500, statusText: 'Server Error' });
    });
  });
});
