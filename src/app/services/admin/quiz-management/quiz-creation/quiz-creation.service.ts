import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DropDownData } from '../../../../shared/interfaces/drop-down-data.interface';
import { PaginatedDataResponse } from '../../../../shared/interfaces/paginated-data-response.interface';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../../environments/environment.dev';
import { EndPoints } from '../../../../shared/enums/end-point.enum';
import { PaginationRequest } from '../../../../shared/interfaces/pagination-request.interface';
import {
  ExportQuizQuestionsRequestDto,
  QuestionPoolList,
  QuestionResponseDto,
  QuizResponse,
  SaveQuizRequest,
} from '../../../../shared/interfaces/quiz-creation.interface';

@Injectable({
  providedIn: 'root',
})
export class QuizCreationService {
  // Inject HttpClient
  private readonly http = inject(HttpClient);

  /**
   * Fetch dropdown values for a given type (e.g. categories, difficulty levels, etc.)
   * @param type dropdown type identifier
   */
  getDropDownData(type: number): Observable<ApiResponse<DropDownData[]>> {
    return this.http
      .get<
        ApiResponse<DropDownData[]>
      >(`${environment.baseUrl}/${EndPoints.DropDownData}?type=${type}`)
      .pipe(map((res) => res));
  }

  /**
   * Fetch paginated list of questions for the question pool
   * @param request pagination + filter request payload
   */
  getQuestions(
    request: PaginationRequest,
  ): Observable<ApiResponse<PaginatedDataResponse<QuestionPoolList>>> {
    return this.http
      .post<
        ApiResponse<PaginatedDataResponse<QuestionPoolList>>
      >(`${environment.baseUrl}/${EndPoints.QuestionPoolList}`, request)
      .pipe(map((res) => res));
  }

  /**
   * Create a new quiz or update an existing quiz
   * @param request quiz save request payload
   */
  createOrUpdateQuiz(request: SaveQuizRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.CreateOrUpdateQuiz}`,
      request,
    );
  }

  /**
   * Fetch quiz details by quiz ID
   * @param quizId quiz identifier
   */
  getQuiz(quizId: number): Observable<ApiResponse<QuizResponse>> {
    return this.http.get<ApiResponse<QuizResponse>>(
      `${environment.baseUrl}/${EndPoints.GetQuizById}/${quizId}`,
    );
  }

  /**
   * Import questions from a CSV file
   * @param file CSV file containing quiz questions
   */
  getQuestionsFromCsv(file: File): Observable<ApiResponse<QuestionResponseDto[]>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<
        ApiResponse<QuestionResponseDto[]>
      >(`${environment.baseUrl}/${EndPoints.PreviewQuestionsFromCsv}`, formData)
      .pipe(map((res) => res));
  }

  /**
   * Import questions from an Excel file
   * @param file Excel file containing quiz questions
   */
  getQuestionsFromExcel(file: File): Observable<ApiResponse<QuestionResponseDto[]>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<
        ApiResponse<QuestionResponseDto[]>
      >(`${environment.baseUrl}/${EndPoints.PreviewQuestionsFromExcel}`, formData)
      .pipe(map((res) => res));
  }

  /**
   * Export quiz questions to a CSV file
   * @param request export request payload containing quizId & filters
   */
  exportCsv(request: ExportQuizQuestionsRequestDto): Observable<Blob> {
    return this.http.post(`${environment.baseUrl}/${EndPoints.ExportQuestions}`, request, {
      responseType: 'blob',
    });
  }
}
