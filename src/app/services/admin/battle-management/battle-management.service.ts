import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { BattleManagementDataResponseDto } from '../../../pages/admin/battle-management/interfaces/battle-management.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { DropDownData } from '../../../shared/interfaces/drop-down-data.interface';
import {
  BattleResponse,
  QuestionDifficultyXP,
  QuestionPoolList,
  QuestionResponseDto,
  SaveBattleRequest,
} from '../../../pages/admin/battle-management/interfaces/battle-creation.interface';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { ExportQuizQuestionsRequestDto } from '../../../shared/interfaces/quiz-creation.interface';

@Injectable({
  providedIn: 'root',
})
export class BattleManagementService {
  private readonly http = inject(HttpClient);

  /**
   * Fetch the list of battles and map them into battle card data.
   * Returns an empty array if the response is invalid.
   */
  getBattles(batchNumber: number = 1): Observable<ApiResponse<BattleManagementDataResponseDto>> {
    return this.http.post<ApiResponse<BattleManagementDataResponseDto>>(
      `${environment.baseUrl}/${EndPoints.BattleManagementList}`,
      { batchNumber },
    );
  }

  /**
   * Fetch dropdown values based on a given type (e.g., category, difficulty, etc.).
   * @param type Identifier for the dropdown data type
   */
  getDropDownData(type: number): Observable<ApiResponse<DropDownData[]>> {
    return this.http
      .get<
        ApiResponse<DropDownData[]>
      >(`${environment.baseUrl}/${EndPoints.DropDownData}?type=${type}`)
      .pipe(map((res) => res));
  }

  /**
   * Fetch XP values for each question difficulty level.
   */
  getQuestionDifficultyXP(): Observable<ApiResponse<QuestionDifficultyXP[]>> {
    return this.http
      .get<
        ApiResponse<QuestionDifficultyXP[]>
      >(`${environment.baseUrl}/${EndPoints.QuestionDifficultyXP}`)
      .pipe(map((res) => res));
  }

  /**
   * Fetch a paginated and filtered list of questions from the question pool.
   * @param request Pagination and filter parameters
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
   * Preview questions by importing them from a CSV file.
   * @param file CSV file containing questions
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
   * Preview questions by importing them from an Excel file.
   * @param file Excel file containing questions
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
   * Export battle questions to a downloadable CSV file.
   * @param request Export payload (includes battleName and questions)
   */
  exportCsv(request: ExportQuizQuestionsRequestDto): Observable<Blob> {
    return this.http.post(`${environment.baseUrl}/${EndPoints.ExportQuestions}`, request, {
      responseType: 'blob',
    });
  }

  /**
   * Delete a battle by its ID.
   * @param battleId Unique identifier of the battle
   */
  deleteBattle(battleId: number): Observable<ApiResponse<null>> {
    return this.http
      .delete<ApiResponse<null>>(`${environment.baseUrl}/${EndPoints.DeleteBattle}/${battleId}`)
      .pipe(map((res) => res));
  }

  /**
   * Fetch details of a single battle by its ID.
   * @param battleId Unique identifier of the battle
   */
  getBattle(battleId: number): Observable<ApiResponse<BattleResponse>> {
    return this.http.get<ApiResponse<BattleResponse>>(
      `${environment.baseUrl}/${EndPoints.GetBattleById}/${battleId}`,
    );
  }

  /**
   * Create a new battle or update an existing one.
   * @param request Payload containing battle details
   */
  createOrUpdateBattle(request: SaveBattleRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.CreateOrUpdateBattle}`,
      request,
    );
  }
}
