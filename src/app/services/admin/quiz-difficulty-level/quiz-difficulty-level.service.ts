import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { DifficultyLevelCredentials } from '../../../pages/admin/quiz-difficulty-level/interfaces/quiz-difficulty-level.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { skipLoader } from '../../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class QuizDifficultyLevelService {
  private readonly http = inject(HttpClient);

  getAllQuizDifficulties(): Observable<ApiResponse<DifficultyLevelCredentials[]>> {
    return this.http.get<ApiResponse<DifficultyLevelCredentials[]>>(
      `${environment.baseUrl}/${EndPoints.QuizDifficultyLevel}`,
    );
  }
  checkNameExists(name: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${environment.baseUrl}/${EndPoints.QuizDifficultyNameAvailable}/${encodeURIComponent(name)}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  createDifficultyLevel(data: DifficultyLevelCredentials): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.CreateQuizDifficultyLevel}`,
      data,
    );
  }
}
