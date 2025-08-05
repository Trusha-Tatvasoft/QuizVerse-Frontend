import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { HttpClient } from '@angular/common/http';
import {
  AdminDashboardData,
  ChartDataPoint,
  DateRangeQuery,
} from '../../../pages/admin/admin-dashboard/interfaces/admin-dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardDataService {
  private readonly http = inject(HttpClient);

  getAdminDashboardStats(): Observable<ApiResponse<AdminDashboardData>> {
    return this.http.get<ApiResponse<AdminDashboardData>>(
      `${environment.baseUrl}/${EndPoints.AdminDashboardData}`,
    );
  }

  getUserEngagementData({
    start_date,
    end_date,
  }: DateRangeQuery): Observable<ApiResponse<ChartDataPoint[]>> {
    return this.http.get<ApiResponse<ChartDataPoint[]>>(
      `${environment.baseUrl}/${EndPoints.getUserEngagementData}`,
      {
        params: { start_date, end_date },
      },
    );
  }

  getPerformaceScoreData({
    start_date,
    end_date,
  }: DateRangeQuery): Observable<ApiResponse<ChartDataPoint[]>> {
    return this.http.get<ApiResponse<ChartDataPoint[]>>(
      `${environment.baseUrl}/${EndPoints.getPerformaceScoreData}`,
      {
        params: { start_date, end_date },
      },
    );
  }

  getRevenueTrendData({
    start_date,
    end_date,
  }: DateRangeQuery): Observable<ApiResponse<ChartDataPoint[]>> {
    return this.http.get<ApiResponse<ChartDataPoint[]>>(
      `${environment.baseUrl}/${EndPoints.getRevenueTrendData}`,
      {
        params: { start_date, end_date },
      },
    );
  }
}
