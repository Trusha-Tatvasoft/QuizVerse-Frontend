import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { BattleManagementData } from '../../../pages/admin/battle-management/interfaces/battle-management.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { battleToBattleCardData } from '../../../pages/admin/battle-management/battle-management-list.mapper';

@Injectable({
  providedIn: 'root',
})
export class BattleManagementService {
  private readonly http = inject(HttpClient);

  getBattles(): Observable<ReturnType<typeof battleToBattleCardData>[]> {
    return this.http
      .get<
        ApiResponse<BattleManagementData[]>
      >(`${environment.baseUrl}/${EndPoints.BattleManagementList}`)
      .pipe(
        map((res) => {
          if (!res.result || res.statusCode !== 200) return [];
          return res.data.map(battleToBattleCardData);
        }),
      );
  }
}
