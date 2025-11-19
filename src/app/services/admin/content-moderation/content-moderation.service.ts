import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { QuizReportIssueResponseDTO } from '../../../pages/admin/content-moderation/components/reported-quiz/interfaces/reported-quiz.interface';
import { ContentModerationSummary } from '../../../pages/admin/content-moderation/interfaces/content-moderation-summary.interface';

@Injectable({
  providedIn: 'root',
})
export class ContentModerationService {
  private readonly http = inject(HttpClient);

  getContentModerationMetricsData(): Observable<ApiResponse<ContentModerationSummary>> {
    return this.http.get<ApiResponse<ContentModerationSummary>>(
      `${environment.baseUrl}/${EndPoints.ContentModerationMatricsData}`,
    );
  }

  getReportedQuizList(
    query: PaginationRequest,
  ): Observable<ApiResponse<PaginatedDataResponse<QuizReportIssueResponseDTO>>> {
    return this.http.post<ApiResponse<PaginatedDataResponse<QuizReportIssueResponseDTO>>>(
      `${environment.baseUrl}/${EndPoints.GetQuizReportByPagination}`,
      query,
    );
  }
}
