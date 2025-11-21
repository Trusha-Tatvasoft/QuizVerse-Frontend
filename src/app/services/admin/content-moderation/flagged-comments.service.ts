import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { skipLoader } from '../../../utils/constants';
import {
  FlaggedComments,
  FlaggedCommentView,
  UpdateFlaggedCommentStatusRequest,
} from '../../../pages/admin/content-moderation/interfaces/flagged-comments.interface';

@Injectable({
  providedIn: 'root',
})
export class FlaggedCommentsService {
  flaggedCommentUpdated$ = new BehaviorSubject<boolean>(false);

  private readonly http = inject(HttpClient);

  getFlaggedCommentsList(
    request: PaginationRequest,
  ): Observable<ApiResponse<PaginatedDataResponse<FlaggedComments>>> {
    return this.http
      .post<
        ApiResponse<PaginatedDataResponse<FlaggedComments>>
      >(`${environment.baseUrl}/${EndPoints.FlaggedContentList}`, request)
      .pipe(map((res) => res)); // Extract `data` from wrapped ApiResponse
  }

  updateAction(payload: UpdateFlaggedCommentStatusRequest): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.ManageFlaggedCommentStatus}`,
      payload,
    );
  }

  getFlaggedCommentsPreviewById(id: number): Observable<ApiResponse<FlaggedCommentView>> {
    return this.http.get<ApiResponse<FlaggedCommentView>>(
      `${environment.baseUrl}/${EndPoints.FlaggedCommentsById}/${id}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  notifyFlaggedCommentUpdated() {
    this.flaggedCommentUpdated$.next(true);
  }
}
