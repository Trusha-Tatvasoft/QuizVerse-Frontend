import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import {
  CategoryLeaderEntry,
  LeaderboardEntry,
  UserLeaderboardStats,
  WeeklyLeaderEntry,
} from '../../../pages/user/user-leaderboard/interfaces/user-leaderboard.interface';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  private readonly http = inject(HttpClient);

  /**
   * Fetch user leaderboard statistics (global rank, total XP, current level) from backend.
   * @returns Observable of user leaderboard stats wrapped in ApiResponse.
   */
  getUserLeaderboardStats(): Observable<ApiResponse<UserLeaderboardStats>> {
    return this.http.get<ApiResponse<UserLeaderboardStats>>(
      `${environment.baseUrl}/${EndPoints.UserLeaderboardStats}`,
    );
  }

  /**
   * Fetch global leaderboard data from backend.
   * @returns Observable of leaderboard entries wrapped in ApiResponse.
   */
  getGlobalLeaderboard(): Observable<ApiResponse<LeaderboardEntry[]>> {
    return this.http.get<ApiResponse<LeaderboardEntry[]>>(
      `${environment.baseUrl}/${EndPoints.GlobalLeaderboard}`,
    );
  }

  /**
   * Fetch weekly leaderboard data from backend.
   * @returns Observable of weekly leader entries wrapped in ApiResponse.
   */
  getWeeklyLeaderboard(): Observable<ApiResponse<WeeklyLeaderEntry[]>> {
    return this.http.get<ApiResponse<WeeklyLeaderEntry[]>>(
      `${environment.baseUrl}/${EndPoints.WeeklyLeaderboard}`,
    );
  }

  /**
   * Fetch category-wise leaderboard data from backend.
   * @param categoryId The ID of the quiz category.
   * @returns Observable of leaderboard entries wrapped in ApiResponse.
   */
  getCategoryLeaderboard(categoryId: number): Observable<ApiResponse<CategoryLeaderEntry[]>> {
    return this.http.get<ApiResponse<CategoryLeaderEntry[]>>(
      `${environment.baseUrl}/${EndPoints.CategoryLeaderboard}?categoryId=${categoryId}`,
    );
  }
}
