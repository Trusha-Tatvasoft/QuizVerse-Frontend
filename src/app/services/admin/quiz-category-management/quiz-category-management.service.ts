import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import {
  QuizCategoryList,
  SaveQuizCategory,
} from '../../../pages/admin/quiz-categories/interface/quiz-category-list-data.interface';
import { skipLoader } from '../../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class QuizCategoryManagementService {
  private readonly http = inject(HttpClient);

  getQuizCategoryList(
    request: PaginationRequest,
  ): Observable<ApiResponse<PaginatedDataResponse<QuizCategoryList>>> {
    return this.http
      .post<
        ApiResponse<PaginatedDataResponse<QuizCategoryList>>
      >(`${environment.baseUrl}/${EndPoints.QuizCategoryTableData}`, request)
      .pipe(map((res) => res));
  }

  createOrUpdateQuizCategory(request: SaveQuizCategory): Observable<ApiResponse<null>> {
    return this.http
      .post<
        ApiResponse<null>
      >(`${environment.baseUrl}/${EndPoints.CreateOrUpdateQuizCategory}`, request)
      .pipe(map((res) => res));
  }

  getCategoryById(id: number): Observable<ApiResponse<QuizCategoryList>> {
    return this.http
      .get<
        ApiResponse<QuizCategoryList>
      >(`${environment.baseUrl}/${EndPoints.GetQuizCategoryById}/${id}`)
      .pipe(map((res) => res));
  }

  updateQuizCategoryByAction(payload: {
    id: number;
    action: number;
    newStatus: number;
  }): Observable<ApiResponse<null>> {
    return this.http
      .put<
        ApiResponse<null>
      >(`${environment.baseUrl}/${EndPoints.UpdateQuizCategoryByAction}`, payload)
      .pipe(map((res) => res));
  }

  checkQuizCategoryNameAvailable(
    categoryName: string,
    id?: number,
  ): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${environment.baseUrl}/${EndPoints.CheckQuizCategoryNameAvailable}`,
      {
        params: {
          categoryName: categoryName,
          ...(id !== undefined && id !== null ? { id: id.toString() } : {}),
        },
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }
}
