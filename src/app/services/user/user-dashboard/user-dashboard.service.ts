import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { UserDashboardApiResponse } from '../../../pages/user/user-dashboard/interfaces/user-dashboard-api-response.interface';
import { UserDashboardData } from '../../../pages/user/user-dashboard/interfaces/user-performance-summary.interface';
import { platformMessages } from '../../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class UserDashboardService {
  private readonly http = inject(HttpClient);
  private readonly snackBarService = inject(SnackbarService);
  getDashboardData(): Observable<UserDashboardData> {
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
          } as UserDashboardData;
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
}
