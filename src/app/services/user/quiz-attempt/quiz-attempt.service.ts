import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import {
  QuizInstructionsResponse,
  QuizQuestionResponse,
  QuizStartResponse,
  SaveAndNextQuestionRequest,
  SubmitQuizRequest,
} from '../../../pages/user/quiz-attempt-layout/interfaces/quiz-attempt.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';

@Injectable({
  providedIn: 'root',
})
export class QuizAttemptService {
  private readonly http = inject(HttpClient);

  /**
   * Fetch quiz instructions for a given quiz.
   * @param quizId - ID of the quiz.
   * @returns Observable with quiz instructions wrapped in ApiResponse.
   */
  getQuizInstructions(quizId: number): Observable<ApiResponse<QuizInstructionsResponse>> {
    return this.http.get<ApiResponse<QuizInstructionsResponse>>(
      `${environment.baseUrl}/${EndPoints.getQuizInstructions}/${quizId}`,
    );
  }

  /**
   * Start a quiz session.
   * @param quizId - ID of the quiz to start.
   * @returns Observable with quiz start details wrapped in ApiResponse.
   */
  startQuiz(quizId: number): Observable<ApiResponse<QuizStartResponse>> {
    return this.http.post<ApiResponse<QuizStartResponse>>(
      `${environment.baseUrl}/${EndPoints.StartQuiz}/${quizId}`,
      {},
    );
  }

  /**
   * Save the current answer and fetch the next question.
   * @param nextquestion - Request payload containing quizId, current question, given answer, and next question number.
   * @returns Observable with next quiz question wrapped in ApiResponse.
   */
  saveAndGetNextQuestion(
    nextquestion: SaveAndNextQuestionRequest,
  ): Observable<ApiResponse<QuizQuestionResponse>> {
    return this.http.post<ApiResponse<QuizQuestionResponse>>(
      `${environment.baseUrl}/${EndPoints.saveAndGetNextQuestion}`,
      nextquestion,
    );
  }

  /**
   * Submit the quiz attempt.
   * @param submitQuizRequest - Request payload containing quizId, answers, and other submission details.
   * @returns Observable with ApiResponse confirming submission.
   */
  submitQuiz(submitQuizRequest: SubmitQuizRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.submitQuiz}`,
      submitQuizRequest,
    );
  }
}
