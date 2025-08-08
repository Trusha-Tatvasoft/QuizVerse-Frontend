import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { AdminDashboardDataService } from './admin-dashboard-data.service';
import { AdminDashboardSummary } from '../../../pages/admin/admin-dashboard/interfaces/admin-dashboard-summary.interface';
import {
  ChartDataPoint,
  DateRangeQuery,
} from '../../../pages/admin/admin-dashboard/interfaces/chart-data-point.interface';

describe('AdminDashboardDataService', () => {
  let service: AdminDashboardDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminDashboardDataService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AdminDashboardDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch admin dashboard stats', () => {
    const mockResponse: ApiResponse<AdminDashboardSummary> = {
      result: true,
      statusCode: 200,
      message: 'Dashboard data fetched successfully',
      data: {
        totalUsers: { value: 1500, trendPercentage: 12 },
        activeQuizzes: { value: 120, trendPercentage: 5 },
        revenue: { value: 50000, trendPercentage: 10 },
        reports: { value: 45, trendPercentage: -3 },
      },
    };

    service.getAdminDashboardStats().subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(response.data.totalUsers.value).toBe(1500);
      expect(response.data.revenue.trendPercentage).toBe(10);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.AdminDashboardData}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch user engagement data', () => {
    const dateRange: DateRangeQuery = {
      start_date: '2025-01-01',
      end_date: '2025-01-31',
    };

    const mockResponse: ApiResponse<ChartDataPoint[]> = {
      result: true,
      statusCode: 200,
      message: 'Engagement data fetched',
      data: [{ label: '2025-01-01', value: 100 }],
    };

    service.getUserEngagementData(dateRange).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.getUserEngagementData}?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch performance score data', () => {
    const dateRange: DateRangeQuery = {
      start_date: '2025-02-01',
      end_date: '2025-02-28',
    };

    const mockResponse: ApiResponse<ChartDataPoint[]> = {
      result: true,
      statusCode: 200,
      message: 'Performance data',
      data: [{ label: '2025-02-01', value: 88 }],
    };

    service.getPerformaceScoreData(dateRange).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.getPerformaceScoreData}?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch revenue trend data', () => {
    const dateRange: DateRangeQuery = {
      start_date: '2025-03-01',
      end_date: '2025-03-31',
    };

    const mockResponse: ApiResponse<ChartDataPoint[]> = {
      result: true,
      statusCode: 200,
      message: 'Revenue trend fetched',
      data: [{ label: '2025-03-01', value: 1200 }],
    };

    service.getRevenueTrendData(dateRange).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.getRevenueTrendData}?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
