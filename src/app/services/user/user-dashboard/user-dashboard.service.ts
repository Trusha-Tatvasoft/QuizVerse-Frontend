import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserDashboardData } from '../../../pages/user/user-dashboard/interfaces/user-performance-summary.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../utils/constants';
import { UserDashboardApiResponse } from '../../../pages/user/user-dashboard/interfaces/user-dashboard-api-response.interface';
import { BattleRequest } from '../../../pages/user/user-dashboard/interfaces/battle-request.interface';
import { RankProgress } from '../../../pages/user/user-dashboard/interfaces/rank-progress.interface';
import { QuizResult } from '../../../pages/user/user-dashboard/interfaces/quiz-result.interface';
import { FeaturedQuizList } from '../../../pages/user/user-dashboard/interfaces/featured-quiz.interface';
import { BattleRequestAction } from '../../../pages/user/user-dashboard/interfaces/battle-request-action.interface';

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

  getFeaturedQuizzes(batchNumber: number = 1): Observable<ApiResponse<FeaturedQuizList>> {
    return this.http.get<ApiResponse<FeaturedQuizList>>(
      `${environment.baseUrl}/${EndPoints.GetFeaturedQuizzes}`,
      {
        params: { BatchNumber: batchNumber },
      },
    );
  }

  getBattleRequests(): Observable<ApiResponse<BattleRequest[]>> {
    return this.http.get<ApiResponse<BattleRequest[]>>(
      `${environment.baseUrl}/${EndPoints.GetBattleRequests}`,
    );
  }

  getRecentQuizzes(viewAll: boolean = false): Observable<ApiResponse<QuizResult[]>> {
    return this.http.get<ApiResponse<QuizResult[]>>(
      `${environment.baseUrl}/${EndPoints.GetRecentQuizzes}`,
      {
        params: { ViewAll: viewAll },
      },
    );
  }

  updateBattleRequestStatus(payload: BattleRequestAction): Observable<ApiResponse<boolean>> {
    return this.http
      .put<
        ApiResponse<boolean>
      >(`${environment.baseUrl}/${EndPoints.UpdateBattleRequestStatus}`, payload)
      .pipe(
        map((res) => {
          if (res.result && res.data) {
            this.snackBarService.showSuccess(platformMessages.successTitle, res.message);
            return res;
          } else {
            throw new Error(res.message || 'Failed to update battle request status');
          }
        }),
        catchError((err) => {
          this.snackBarService.showError(
            platformMessages.errorTitle,
            platformMessages.errorMessage,
          );
          return throwError(() => err);
        }),
      );
  }
}
