import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { BrowseQuizzesService } from './browse-quizzes.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import {
  BrowseQuizzesRequest,
  QuizReportRequest,
} from '../../../pages/user/browse-quizzes/interfaces/browsr-quiz-request.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { BrowseQuizzesApiResponse } from '../../../pages/user/browse-quizzes/interfaces/browse-quiz-response.interface';

describe('BrowseQuizzesService', () => {
  let service: BrowseQuizzesService;
  let httpMock: jest.Mocked<HttpClient>;

  beforeEach(() => {
    const httpClientMock = {
      post: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [BrowseQuizzesService, { provide: HttpClient, useValue: httpClientMock }],
    });

    service = TestBed.inject(BrowseQuizzesService);
    httpMock = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should send POST request to correct URL with given payload (browseQuizzes)', (done) => {
    const mockPayload: BrowseQuizzesRequest = {
      searchText: 'test',
      batchNumber: 1,
      quizCategoryId: null,
      quizDifficultyLevelId: null,
      browseQuizzesSorting: null,
      browseQuizzesFilterByType: null,
      filterRanges: {
        minPrice: 0,
        maxPrice: 1000,
        minRating: 0,
        maxRating: 5,
        minTotalTime: 2,
        maxTotalTime: 180,
      },
      tags: null,
    };

    const mockResponse: ApiResponse<BrowseQuizzesApiResponse> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: {
        quizzes: [],
        hasMore: false,
        totalFeatured: 0,
        totalAll: 0,
        totalFree: 0,
        totalPremium: 0,
      },
    };

    httpMock.post.mockReturnValue(of(mockResponse));

    service.browseQuizzes(mockPayload).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(httpMock.post).toHaveBeenCalledWith(
        `${environment.baseUrl}/${EndPoints.BrowseQuizzes}`,
        mockPayload,
      );
      done();
    });
  });

  it('should send POST request to correct URL with given payload (reportQuiz)', (done) => {
    const mockPayload: QuizReportRequest = {
      quizId: 1,
      reportId: 123,
      reason: 'Spam report',
    };

    const mockResponse: ApiResponse<object> = {
      result: true,
      statusCode: 200,
      message: 'Report submitted successfully',
      data: {},
    };

    httpMock.post.mockReturnValue(of(mockResponse));

    service.reportQuiz(mockPayload).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(httpMock.post).toHaveBeenCalledWith(
        `${environment.baseUrl}/${EndPoints.AddQuizReport}`,
        mockPayload,
      );
      done();
    });
  });
});
