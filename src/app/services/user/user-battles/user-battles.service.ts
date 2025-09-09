import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { UserBattleLeaderboardData } from '../../../pages/user/user-battles/interface/user-battles.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';

@Injectable({
  providedIn: 'root',
})
export class UserBattlesService {
  constructor(private readonly http: HttpClient) {}

  getBattleLeaderboardList(): Observable<ApiResponse<UserBattleLeaderboardData[]>> {
    return this.http.get<ApiResponse<UserBattleLeaderboardData[]>>(
      `${environment.baseUrl}/${EndPoints.GetBattleLeaderboardList}`,
    );
  }
}
