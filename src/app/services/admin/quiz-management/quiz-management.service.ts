import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { QuizManagementSummary } from '../../../pages/admin/quiz-management/interfaces/quiz-management-summary.interface';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { QuizListData } from '../../../pages/admin/quiz-management/interfaces/quiz-table-data.interface';

@Injectable({
  providedIn: 'root',
})
export class QuizManagementService {
  private readonly http = inject(HttpClient);

  /**
   * Fetch overall quiz management statistics from backend.
   * @returns Observable of quiz management summary data.
   */
  getQuizManagementStats(): Observable<ApiResponse<QuizManagementSummary>> {
    return this.http.get<ApiResponse<QuizManagementSummary>>(
      `${environment.baseUrl}/${EndPoints.QuizManagementStats}`,
    );
  }

  /**
   * Fetch paginated, filtered, sorted quiz list from backend.
   * @param request - PaginationRequest with search, filters, and sort.
   * @returns Observable of paginated quiz data.
   */
  getQuizzes(
    request: PaginationRequest,
  ): Observable<ApiResponse<PaginatedDataResponse<QuizListData>>> {
    return this.http
      .post<
        ApiResponse<PaginatedDataResponse<QuizListData>>
      >(`${environment.baseUrl}/${EndPoints.QuizTableData}`, request)
      .pipe(map((res) => res)); // Extract `data` from wrapped ApiResponse
  }

  /**
   * Delete a quiz by its ID.
   * @param id - The ID of the quiz to delete.
   * @returns Observable<ApiResponse<object>> - response from backend after deletion.
   */
  deleteQuiz(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${environment.baseUrl}/${EndPoints.DeleteQuiz}/${id}`,
    );
  }
}
