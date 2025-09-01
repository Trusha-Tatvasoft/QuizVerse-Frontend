import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { BattleManagementData } from '../../../pages/admin/battle-management/interfaces/battle-management.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { battleToBattleCardData } from '../../../pages/admin/battle-management/battle-management-list.mapper';
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

  getBattles(): Observable<ReturnType<typeof battleToBattleCardData>[]> {
    return this.http
      .get<
        ApiResponse<BattleManagementData[]>
      >(`${environment.baseUrl}/${EndPoints.BattleManagementList}`)
      .pipe(
        map((res) => {
          if (!res.result || res.statusCode !== 200) return [];
          return res.data.map(battleToBattleCardData);
        }),
      );
  }

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
   * Fetch dropdown values for a given type (e.g. categories, difficulty levels, etc.)
   * @param type dropdown type identifier
   */
  getQuestionDifficultyXP(): Observable<ApiResponse<QuestionDifficultyXP[]>> {
    return this.http
      .get<
        ApiResponse<QuestionDifficultyXP[]>
      >(`${environment.baseUrl}/${EndPoints.QuestionDifficultyXP}`)
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
   * Import questions from a CSV file
   * @param file CSV file containing battle questions
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
   * @param file Excel file containing battle questions
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
   * Export battle questions to a CSV file
   * @param request export request payload containing battleName & questions
   */
  exportCsv(request: ExportQuizQuestionsRequestDto): Observable<Blob> {
    return this.http.post(`${environment.baseUrl}/${EndPoints.ExportQuestions}`, request, {
      responseType: 'blob',
    });
  }

  /**
   * Delete a battle by its ID
   * @param battleId battle identifier
   */
  deleteBattle(battleId: number): Observable<ApiResponse<null>> {
    return this.http
      .delete<ApiResponse<null>>(`${environment.baseUrl}/${EndPoints.DeleteBattle}/${battleId}`)
      .pipe(map((res) => res));
  }

  /**
   * Fetch quiz details by battle ID
   * @param battleId battle identifier
   */
  getBattle(battleId: number): Observable<ApiResponse<BattleResponse>> {
    return this.http.get<ApiResponse<BattleResponse>>(
      `${environment.baseUrl}/${EndPoints.GetBattleById}/${battleId}`,
    );
  }

  /**
   * Create a new battle or update an existing battle
   * @param request battle save request payload
   */
  createOrUpdateBattle(request: SaveBattleRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.CreateOrUpdateBattle}`,
      request,
    );
  }
}
