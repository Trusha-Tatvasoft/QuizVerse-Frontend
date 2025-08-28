import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import {
  LeaderboardEntry,
  UserLeaderboardStats,
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
}
