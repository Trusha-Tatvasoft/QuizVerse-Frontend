import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import {
  ActiveQuizBattleAffectedDTO,
  QuestionDetailExtended,
  ReportQuestion,
} from '../../../pages/admin/content-moderation/interfaces/report-question.interface';
import { QuestionOrQuizIssueReportStatus } from '../../../shared/enums/content-moderation.enum';
import { skipLoader } from '../../../utils/constants';
import { QuestionRequest } from '../../../pages/admin/question-pool/interfaces/question-request.interface';

@Injectable({
  providedIn: 'root',
})
export class ReportQuestionsService {
  private readonly http = inject(HttpClient);

  getReportedQuestionList(
    request: PaginationRequest,
  ): Observable<ApiResponse<PaginatedDataResponse<ReportQuestion>>> {
    return this.http
      .post<
        ApiResponse<PaginatedDataResponse<ReportQuestion>>
      >(`${environment.baseUrl}/${EndPoints.ReportQuestionsList}`, request)
      .pipe(map((res) => res));
  }

  updateAction(payload: {
    ReportId: number;
    QuestionOrQuizIssueReportNewStatus: QuestionOrQuizIssueReportStatus;
  }): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.ReportQuestionAction}`,
      payload,
    );
  }

  getReportedQuestionPreviewById(id: number): Observable<ApiResponse<QuestionDetailExtended>> {
    return this.http.get<ApiResponse<QuestionDetailExtended>>(
      `${environment.baseUrl}/${EndPoints.GetReportedQuestionPreview}/${id}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  ActiveQuizBattleAffectedDTO(
    queId: number,
  ): Observable<ApiResponse<ActiveQuizBattleAffectedDTO[]>> {
    return this.http.get<ApiResponse<ActiveQuizBattleAffectedDTO[]>>(
      `${environment.baseUrl}/${EndPoints.GetListOfAffectedQuizAndBattle}/${queId}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  UpdateReportedQuestion(reportId: number, dto: QuestionRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${environment.baseUrl}/${EndPoints.UpdateReportedQuestion}/${reportId}`,
      dto,
    );
  }
}
