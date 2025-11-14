import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ContentModerationService } from './content-moderation.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { ContentModerationSummary } from '../../../pages/admin/content-moderation/interfaces/content-moderation-summary.interface';

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
    };

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
});
