import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { QuestionPoolListData } from '../../../pages/admin/question-pool/interfaces/question-pool-list-data.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';
import { skipLoader } from '../../../utils/constants';
import { QuestionDetail } from '../../../pages/admin/question-pool/interfaces/question-pool-preview.interface';
import { QuestionRequest } from '../../../pages/admin/question-pool/interfaces/question-request.interface';
import { GenerateQuestionFromPromptRequest, GenerateQuestionFromWebUrlRequest } from '../../../pages/admin/question-pool/interfaces/question-pool-ai-tab.interface';

@Injectable({
  providedIn: 'root',
})
export class QuestionPoolService {
  private readonly http = inject(HttpClient);

  /**
   * Fetch paginated, filtered, sorted question pool list from backend.
   * @param request - PaginationRequest with search, filters, and sort.
   * @returns Observable of paginated question pool data.
   */
  getQuestionPoolList(
    request: PaginationRequest,
  ): Observable<ApiResponse<PaginatedDataResponse<QuestionPoolListData>>> {
    return this.http
      .post<
        ApiResponse<PaginatedDataResponse<QuestionPoolListData>>
      >(`${environment.baseUrl}/${EndPoints.QuestionPoolList}`, request)
      .pipe(map((res) => res));
  }

  /**
   * Delete a question by its ID.
   * @param id - The ID of the question to delete.
   * @returns Observable<ApiResponse<object>> - response from backend after deletion.
   */
  deleteQuestion(id: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${environment.baseUrl}/${EndPoints.DeleteQuestion}/${id}`,
    );
  }

  /**
   * Fetch the details of a single question for preview / edit.
   * @param id - The ID of the question to preview.
   * @returns Observable<ApiResponse<QuestionDetail>> - question detail for preview.
   */
  getQuestionPreviewById(id: number): Observable<ApiResponse<QuestionDetail>> {
    return this.http.get<ApiResponse<QuestionDetail>>(
      `${environment.baseUrl}/${EndPoints.GetQuestionPrevirew}/${id}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  /**
   * Create a new question or update an existing one.
   * @param id - The ID of the question (0 or null for create, existing ID for update).
   * @param dto - The QuestionRequest payload containing question details.
   * @returns Observable<ApiResponse<string>> - response message (T/F) from backend.
   */
  createOrUpdateQuestion(id: number, dto: QuestionRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${environment.baseUrl}/${EndPoints.CreateOrUpdateQuestion}/${id}`,
      dto,
    );
  }

  /**
   * Preview questions from a CSV file before saving.
   * @param file - The CSV file containing questions.
   * @returns Observable<QuestionPoolListData[]> - parsed question list from backend.
   */
  previewQuestionsFromCsv(formData: FormData): Observable<QuestionPoolListData[]> {
    return this.http
      .post<
        ApiResponse<QuestionPoolListData[]>
      >(`${environment.baseUrl}/${EndPoints.PreviewQuestionsFromCsv}`, formData)
      .pipe(map((res) => res.data));
  }

  /**
   * Preview questions from an Excel file before saving.
   * @param file - The Excel file containing questions.
   * @returns Observable<QuestionPoolListData[]> - parsed question list from backend.
   */
  previewQuestionsFromExcel(formData: FormData): Observable<QuestionPoolListData[]> {
    return this.http
      .post<
        ApiResponse<QuestionPoolListData[]>
      >(`${environment.baseUrl}/${EndPoints.PreviewQuestionsFromExcel}`, formData)
      .pipe(map((res) => res.data));
  }

  /**
   * Save selected questions after previewing CSV/Excel uploads.
   * @param questions - List of questions selected from preview.
   * @returns Observable<ApiResponse<string>> - response message after saving.
   */
  saveQuestions(questions: QuestionPoolListData[]): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${environment.baseUrl}/${EndPoints.SaveQuestions}`,
      questions,
    );
  }

  /**
   * Generate quiz questions automatically by analyzing the content of a PDF file.
   * @param formData - The uploaded PDF file wrapped in FormData.
   * @returns Observable<ApiResponse<QuestionPoolListData[]>> - generated questions from backend.
   */
  generateQuestionsFromPdf(formData: FormData) {
    return this.http.post<ApiResponse<QuestionPoolListData[]>>(
      `${environment.baseUrl}/${EndPoints.GenerateFromPdf}`,
      formData,
    );
  }

  generateQuestionsFromTextPrompt(
    requestPayload: GenerateQuestionFromPromptRequest,
  ): Observable<ApiResponse<QuestionPoolListData[]>> {
    return this.http.post<ApiResponse<QuestionPoolListData[]>>(
      `${environment.baseUrl}/${EndPoints.GenerateQuestionFromPromptRequest}`,
      requestPayload,
    );
  }

  getQuestionsUsingWebUrl(
    request: GenerateQuestionFromWebUrlRequest,
  ): Observable<ApiResponse<QuestionPoolListData[]>> {
    return this.http.post<ApiResponse<QuestionPoolListData[]>>(
      `${environment.baseUrl}/${EndPoints.GenerateQuestionFromWebUrlRequest}`,
      request,
    );
  }
}
