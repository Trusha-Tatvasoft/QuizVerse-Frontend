import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { QuizCategoryList } from '../../../pages/admin/quiz-categories/interface/quiz-category-list-data.interface';

@Injectable({
  providedIn: 'root',
})
export class QuizCategoryManagementService {
  private readonly http = inject(HttpClient);
  /**
   * Fetch paginated, sorted quiz category list from backend.
   * @param request - PaginationRequest with search and sort.
   * @returns Observable of paginated quiz category data.
   */
  getQuizCategoryList(
    request: PaginationRequest,
  ): Observable<ApiResponse<PaginatedDataResponse<QuizCategoryList>>> {
    return this.http
      .post<
        ApiResponse<PaginatedDataResponse<QuizCategoryList>>
      >(`${environment.baseUrl}/${EndPoints.QuizCategoryTableData}`, request)
      .pipe(map((res) => res));
  }
}
