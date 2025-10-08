import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { QuizCompletedSummary } from '../../../pages/user/quiz-result-page/interfaces/quiz-completed-summary.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';
import {
  QuestionIssueReportRequest,
  QuizQuestionReview,
} from '../../../pages/user/quiz-result-page/interfaces/quiz-question-review.interface';
import { AnswerExplanationRequest } from '../../../pages/user/quiz-result-page/interfaces/answer-explaination-request.interface';
import { QuizRating } from '../../../pages/user/quiz-result-page/interfaces/quiz-ratting.interface';

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
    return this.http.post<ApiResponse<string>>(
      `${environment.baseUrl}/${EndPoints.GetAnswerExplaination}`,
      request,
    );
  }

  reportQuestionIssue(request: QuestionIssueReportRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.ReportQuestionIssue}`,
      request,
    );
  }

  getMyQuizRating(quizId: number): Observable<ApiResponse<QuizRating | null>> {
    return this.http.get<ApiResponse<QuizRating | null>>(
      `${environment.baseUrl}/${EndPoints.QuizRating}/${quizId}`,
    );
  }

  submitQuizRating(request: QuizRating): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${environment.baseUrl}/${EndPoints.SubmitQuizRating}`,
      request,
    );
  }
}
