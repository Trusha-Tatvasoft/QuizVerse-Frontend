import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { QuestionPoolListData } from '../../../pages/admin/question-pool/interfaces/question-pool-list-data.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class QuestionPoolService {
  private readonly http = inject(HttpClient);

  /**
   * Fetch paginated, filtered, sorted question pool list from backend.
   * @param request - PaginationRequest with search, filters, and sort.
   * @returns Observable of paginated question pool data.
   */
  getQuestionPoolList(
    request: PaginationRequest,
  ): Observable<ApiResponse<PaginatedDataResponse<QuestionPoolListData>>> {
    return this.http
      .post<
        ApiResponse<PaginatedDataResponse<QuestionPoolListData>>
      >(`${environment.baseUrl}/${EndPoints.QuestionPoolList}`, request)
      .pipe(map((res) => res));
  }
}
