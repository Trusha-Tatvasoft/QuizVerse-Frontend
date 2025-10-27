import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { BrowseQuizzesRequest } from '../../../pages/user/browse-quizzes/interfaces/browsr-quiz-request.interface';
import { BrowseQuizzesApiResponse } from '../../../pages/user/browse-quizzes/interfaces/browse-quiz-response.interface';

@Injectable({
  providedIn: 'root',
})
export class BrowseQuizzesService {
  private readonly http = inject(HttpClient);

  browseQuizzes(payload: BrowseQuizzesRequest): Observable<ApiResponse<BrowseQuizzesApiResponse>> {
    return this.http.post<ApiResponse<BrowseQuizzesApiResponse>>(
      `${environment.baseUrl}/${EndPoints.BrowseQuizzes}`,
      payload,
    );
  }
}
