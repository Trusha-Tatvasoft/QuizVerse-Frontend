import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { UserBattleLeaderboardData } from '../../../pages/user/user-battles/interface/user-battles.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { BattleResultResponse } from '../../../pages/user/battle-result/interfaces/battle-result.interface';
import { AvailableBattle } from '../../../pages/user/user-battles/interface/quiz-battles.interface';
import { skipLoader } from '../../../utils/constants';
import { BattleUserSearchResult } from '../../../pages/user/user-battles/available-battles/interfaces/challenge-friend.interface';
import {
  UserRecentBattlesRequestDto,
  UserRecentBattlesResponseDto,
} from '../../../pages/user/user-battles/interface/recent-battles.interface';
import { BattleInstruction } from '../../../pages/user/battle-attempt-layout/interfaces/battle-attempt.interface';

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

  getUserAvailableBattles(): Observable<ApiResponse<AvailableBattle[]>> {
    return this.http.get<ApiResponse<AvailableBattle[]>>(
      `${environment.baseUrl}/${EndPoints.GetUserAvailableBattles}`,
    );
  }
  /**
   * Fetch the list of recent battles for the currently logged-in user.
   * @returns Observable that emits an ApiResponse containing
   *          an array of UserRecentBattles (battle result, opponent, category, XP earned, etc.).
   */
  getUserRecentBattles(
    battleHistoryRequest: UserRecentBattlesRequestDto,
  ): Observable<ApiResponse<UserRecentBattlesResponseDto | null>> {
    return this.http.post<ApiResponse<UserRecentBattlesResponseDto | null>>(
      `${environment.baseUrl}/${EndPoints.GetUserRecentBattles}`,
      battleHistoryRequest,
    );
  }

  /**
   * Send a battle request to another user.
   * @param receiverUsername The username of the user who will receive the battle request.
   * @param battleId The ID of the battle to be requested.
   * @returns Observable that emits an ApiResponse indicating success or failure.
   */
  sendBattleRequest(receiverUsername: string, battleId: number): Observable<ApiResponse<null>> {
    const payload = {
      receiverUsername,
      battleId,
    };

    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.SendBattleRequest}`,
      payload,
    );
  }

  /**
   * Check if a user exists in the system by their username.
   * @param username The username of the friend to verify.
   * @returns Observable that emits an ApiResponse indicating whether the user exists.
   */
  checkUserExistence(username: string): Observable<ApiResponse<null>> {
    return this.http.get<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.CheckUserExistence}/${username}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  /**
   * Search users by username for a given battle.
   * @param userName The username (or partial name) to search.
   * @param battleId The battle ID to filter results.
   * @returns Observable that emits an ApiResponse with user search results.
   */
  searchUsers(
    userName: string,
    battleId: number,
  ): Observable<ApiResponse<BattleUserSearchResult[]>> {
    return this.http.get<ApiResponse<BattleUserSearchResult[]>>(
      `${environment.baseUrl}/${EndPoints.SearchUser}`,
      {
        params: {
          userName,
          battleId,
        },
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  getBattleInstruction(battleId: number): Observable<ApiResponse<BattleInstruction>> {
    const url = `${environment.baseUrl}/${EndPoints.GetBattleInstruction}/${battleId}`;
    return this.http.get<ApiResponse<BattleInstruction>>(url);
  }

  getBattleResult(battleId: number): Observable<ApiResponse<BattleResultResponse>> {
    return this.http.get<ApiResponse<BattleResultResponse>>(
      `${environment.baseUrl}/${EndPoints.GetBattleResult}/${battleId}`,
    );
  }
}
