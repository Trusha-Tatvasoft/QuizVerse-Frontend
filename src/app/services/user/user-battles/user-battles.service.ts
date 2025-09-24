import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { UserBattleLeaderboardData } from '../../../pages/user/user-battles/interface/user-battles.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { UserRecentBattles } from '../../../pages/user/user-battles/interface/recent-battles.interface';

@Injectable({
  providedIn: 'root',
})
export class UserBattlesService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Fetch the leaderboard list for battles.
   * @returns Observable that emits an ApiResponse containing
   *          an array of UserBattleLeaderboardData (users with rank, wins, XP, etc.).
   */
  getBattleLeaderboardList(): Observable<ApiResponse<UserBattleLeaderboardData[]>> {
    return this.http.get<ApiResponse<UserBattleLeaderboardData[]>>(
      `${environment.baseUrl}/${EndPoints.GetBattleLeaderboardList}`,
    );
  }

  /**
   * Fetch the list of recent battles for the currently logged-in user.
   * @returns Observable that emits an ApiResponse containing
   *          an array of UserRecentBattles (battle result, opponent, category, XP earned, etc.).
   */
  getUserRecentBattles(): Observable<ApiResponse<UserRecentBattles[]>> {
    return this.http.get<ApiResponse<UserRecentBattles[]>>(
      `${environment.baseUrl}/${EndPoints.GetUserRecentBattles}`,
    );
  }
}
