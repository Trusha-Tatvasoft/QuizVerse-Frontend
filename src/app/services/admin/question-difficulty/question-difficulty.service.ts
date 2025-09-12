import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import {
  QuestionDifficultyRequestDTO,
  QuestionDifficultyResponseDTO,
} from '../../../pages/admin/question-difficulty/interfaces/question-difficulty.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { skipLoader } from '../../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class QuestionDifficultyService {
  // Use Angular's inject() function for HttpClient instead of constructor injection
  private readonly http = inject(HttpClient);

  /**
   * Fetches all question difficulties from the backend
   * Returns an observable with an array of QuestionDifficultyResponseDTO
   */
  getAllQuestionDifficulties(): Observable<ApiResponse<QuestionDifficultyResponseDTO[]>> {
    return this.http.get<ApiResponse<QuestionDifficultyResponseDTO[]>>(
      `${environment.baseUrl}/${EndPoints.GetAllQuestionDifficulties}`,
    );
  }

  /**
   * Checks if a question difficulty name already exists
   * Returns true if available, false if already taken
   * SkipLoader header prevents the global loader from showing during this call
   */
  checkNameExists(name: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${environment.baseUrl}/${EndPoints.QuestionDifficultyNameAvailable}/${encodeURIComponent(name)}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  /**
   * Checks if a question difficulty XP value already exists
   * Returns true if available, false if already used
   * SkipLoader header prevents the global loader from showing during this call
   */
  checkXPExists(xp: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${environment.baseUrl}/${EndPoints.QuestionDifficultyXPAvailable}/${encodeURIComponent(xp)}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  /**
   * Creates a new or updates an existing question difficulty
   * Accepts a QuestionDifficultyRequestDTO as payload
   * Returns an observable with the API response
   */
  createQuestionDifficultyLevel(data: QuestionDifficultyRequestDTO): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.CreateOrUpdateQuestionDifficultyLevel}`,
      data,
    );
  }
}
