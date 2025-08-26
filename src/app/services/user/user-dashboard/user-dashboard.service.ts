import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { UserDashboard } from '../../../pages/user/user-dashboard/interfaces/user-performance-summary.interface';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../utils/constants';
import { UserDashboardApiResponse } from '../../../pages/user/user-dashboard/interfaces/user-dashboard-api-response.interface';
import { RankProgress } from '../../../pages/user/user-dashboard/interfaces/rank-progress.interface';

@Injectable({
  providedIn: 'root',
})
export class UserDashboardService {
  private readonly http = inject(HttpClient);
  private readonly snackBarService = inject(SnackbarService);
  getDashboardData(): Observable<UserDashboard> {
    return this.http
      .get<
        ApiResponse<UserDashboardApiResponse>
      >(`${environment.baseUrl}/${EndPoints.UserDashboardData}`)
      .pipe(
        map((res) => {
          const data = res.data;
          return {
            banner: {
              userName: data.userName,
              currentRank: data.currentRank,
            },
            card: {
              quizzesCompleted: data.quizzesCompleted,
              totalXp: data.totalXp,
              winRate: data.winRate,
              currentRank: data.currentRank,
            },
          } as UserDashboard;
        }),
        catchError(() => {
          this.snackBarService.showError(
            platformMessages.errorTitle,
            platformMessages.errorMessage,
          );
          return throwError(() => new Error('Failed to load dashboard data.'));
        }),
      );
  }

  getRankProgress(): Observable<RankProgress> {
    return this.http
      .get<ApiResponse<RankProgress>>(`${environment.baseUrl}/${EndPoints.RankProgressData}`)
      .pipe(
        map((res) => {
          if (res.result && res.data) {
            return res.data;
          }
          throw new Error(res.message || 'Failed to fetch rank progress');
        }),
      );
  }
}
