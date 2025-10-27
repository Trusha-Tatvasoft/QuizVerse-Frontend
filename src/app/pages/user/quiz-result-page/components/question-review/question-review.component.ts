import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, inject, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';
import {
  QuestionIssueReportRequest,
  QuizQuestionReviewExtended,
} from '../../interfaces/quiz-question-review.interface';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../../utils/constants';
import { QuizResultService } from '../../../../../services/user/quiz-result/quiz-result.service';
import {
  correctAnswerTagConfig,
  notAttemptedTagConfig,
  wrongAnswerTagConfig,
} from '../../configs/quiz-result-tag.configs';
import { AnswerExplanationRequest } from '../../interfaces/answer-explaination-request.interface';
import { ReportQuestionDialogComponent } from '../report-question-dialog/report-question-dialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-question-review',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TagComponent],
  templateUrl: './question-review.component.html',
  styleUrls: ['./question-review.component.scss'],
})
export class QuestionReviewComponent implements OnInit, OnDestroy {
  private readonly dialog = inject(MatDialog);
  private readonly quizService = inject(QuizResultService);
  private readonly snackBarService = inject(SnackbarService);
  questions: QuizQuestionReviewExtended[] = [];
  private readonly destroy$ = new Subject<void>();

  @Input() quizId!: number; // quizId from parent

  correctAnswerTagConfig = correctAnswerTagConfig;
  wrongAnswerTagConfig = wrongAnswerTagConfig;
  notAttemptTagConfig = notAttemptedTagConfig;

  ngOnInit(): void {
    if (this.quizId) {
      this.loadQuestions(this.quizId);
    } else {
      this.snackBarService.showError(
        platformMessages.errorTitle,
        platformMessages.failedToFatchQuestions,
      );
    }
  }

  fetchExplanation(question: QuizQuestionReviewExtended): void {
    if (question.explanation) {
      question.showExplanation = !question.showExplanation;
      return;
    }

    question.loadingExplanation = true;

    const request: AnswerExplanationRequest = {
      questionText: question.questionText,
      correctAnswer: question.correctAnswer,
      userAnswer: question.userAnswer ?? '',
    };

    this.quizService.getAnswerExplanation(request).subscribe({
      next: (res) => {
        question.explanation = res.result ? res.data : 'Explanation not available.';
        question.showExplanation = true;
        question.loadingExplanation = false;
      },
      error: () => {
        question.explanation = 'Failed to load explanation.';
        question.loadingExplanation = false;

        // Show snackbar with proper error
        this.snackBarService.showError(
          platformMessages.errorTitle,
          platformMessages.failedLoadQuizExplaination,
        );

        this.snackBarService.showError(
          platformMessages.errorTitle,
          platformMessages.failedLoadQuizExplaination,
        );
      },
    });
  }

  openReportDialog(question: QuizQuestionReviewExtended): void {
    const dialogRef = this.dialog.open(ReportQuestionDialogComponent, {
      width: '500px',
    });

    // Pass data via @Input properties
    dialogRef.componentInstance.questionId = question.questionId;
    dialogRef.componentInstance.questionText = question.questionText;

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const request: QuestionIssueReportRequest = {
          quizId: this.quizId,
          questionId: result.questionId,
          description: result.description,
        };

        this.quizService.reportQuestionIssue(request).subscribe({
          next: (response) => {
            this.snackBarService.showSuccess(platformMessages.successTitle, response.message);
          },
          error: (err) => {
            const errorMessage =
              err?.error?.message || err?.message || platformMessages.errorMessage;
            this.snackBarService.showError(platformMessages.errorTitle, errorMessage);
          },
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadQuestions(quizId: number): void {
    this.quizService
      .getQuizQuestionReview(quizId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<QuizQuestionReviewExtended[]>) => {
          if (res.result && res.data) {
            this.questions = res.data.map((q) => ({
              ...q,
              userAnswer: q.userAnswer,
              isCorrect: q.isCorrect,
              loadingExplanation: false,
              showExplanation: false,
              explanation: undefined,
            }));
          }
        },
        error: () => {
          this.snackBarService.showError(
            platformMessages.errorTitle,
            platformMessages.failedLoadQuesPreview,
          );
        },
      });
  }
}
