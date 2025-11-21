import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ContentModerationService } from './content-moderation.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { ContentModerationSummary } from '../../../pages/admin/content-moderation/interfaces/content-moderation-summary.interface';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { QuizReportIssueResponseDTO } from '../../../pages/admin/content-moderation/components/reported-quiz/interfaces/reported-quiz.interface';

describe('ContentModerationService (Jest)', () => {
  let service: ContentModerationService;
  let httpMock: jest.Mocked<HttpClient>;

  const mockResponse: ApiResponse<ContentModerationSummary> = {
    result: true,
    message: 'Fetched successfully',
    statusCode: 200,
    data: {
      pendingReportsCount: 5,
      underReviewReportsCount: 2,
      todayResolvedReportsCount: 7,
      bannedUserCount: 1,
    },
  };

  beforeEach(() => {
    const httpClientMock = {
      get: jest.fn().mockReturnValue(of(mockResponse)),
      post: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [ContentModerationService, { provide: HttpClient, useValue: httpClientMock }],
    });

    TestBed.configureTestingModule({
      providers: [ContentModerationService, { provide: HttpClient, useValue: httpClientMock }],
    });

    service = TestBed.inject(ContentModerationService);
    httpMock = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the correct API endpoint and return metrics data', (done) => {
    service.getContentModerationMetricsData().subscribe((res) => {
      expect(res).toEqual(mockResponse);
      done();
    });

    expect(httpMock.get).toHaveBeenCalledWith(
      `${environment.baseUrl}/${EndPoints.ContentModerationMatricsData}`,
    );
    expect(httpMock.get).toHaveBeenCalledTimes(1);
  });

  it('should call API and return reported quiz list (pagination)', (done) => {
    const query: PaginationRequest = {
      pageNumber: 1,
      pageSize: 10,
      sortDescending: false,
    };

    const mockPaginatedResponse: ApiResponse<PaginatedDataResponse<QuizReportIssueResponseDTO>> = {
      result: true,
      message: 'Fetched successfully',
      statusCode: 200,
      data: {
        totalRecords: 1,
        records: [
          {
            id: 1,
            quizId: 101,
            quizTitle: 'Sample Quiz',
            creator: 'Admin',
            reporter: 'UserA',
            reason: 'Incorrect content',
            severity: 1,
            status: 0,
            createdDate: '2024-01-01',
            reviewedBy: 2,
            reviewer: 'Moderator',
          },
        ],
      },
    };

    httpMock.post.mockReturnValue(of(mockPaginatedResponse));

    service.getReportedQuizList(query).subscribe((res) => {
      expect(res).toEqual(mockPaginatedResponse);
      done();
    });

    expect(httpMock.post).toHaveBeenCalledTimes(1);
    expect(httpMock.post).toHaveBeenCalledWith(
      `${environment.baseUrl}/${EndPoints.GetQuizReportByPagination}`,
      query,
    );
  });
});
