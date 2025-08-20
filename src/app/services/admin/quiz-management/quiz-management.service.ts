import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { QuizManagementSummary } from '../../../pages/admin/quiz-management/interfaces/quiz-management-summary.interface';

@Injectable({
  providedIn: 'root',
})
export class QuizManagementService {
  private readonly http = inject(HttpClient);

  getQuizManagementStats(): Observable<ApiResponse<QuizManagementSummary>> {
    return this.http.post<ApiResponse<QuizManagementSummary>>(
      `${environment.baseUrl}/${EndPoints.QuizManagementStats}`,
      {},
    );
  }
}
