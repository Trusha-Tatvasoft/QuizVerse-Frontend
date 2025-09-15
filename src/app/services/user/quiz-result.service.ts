import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/interfaces/api-response.interface';
import { QuizCompletedSummary } from '../../pages/user/quiz-result-page/interfaces/quiz-completed-summary.interface';
import { environment } from '../../../environments/environment.dev';
import { EndPoints } from '../../shared/enums/end-point.enum';
import { QuizQuestionReview } from '../../pages/user/quiz-result-page/interfaces/quiz-question-review.interface';
import { AnswerExplanationRequest } from '../../pages/user/quiz-result-page/interfaces/answer-explaination-request.interface';

@Injectable({
  providedIn: 'root',
})
export class QuizResultService {
  private readonly http = inject(HttpClient);

  getQuizSummary(quizId: number): Observable<ApiResponse<QuizCompletedSummary>> {
    return this.http.get<ApiResponse<QuizCompletedSummary>>(
      `${environment.baseUrl}/${EndPoints.QuizCompletedSummary}/${quizId}`,
    );
  }

  getQuizQuestionReview(quizId: number): Observable<ApiResponse<QuizQuestionReview[]>> {
    return this.http.get<ApiResponse<QuizQuestionReview[]>>(
      `${environment.baseUrl}/${EndPoints.QuizQuestionReview}/${quizId}`,
    );
  }

  getAnswerExplanation(request: AnswerExplanationRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${environment.baseUrl}/`, request);
  }
}
