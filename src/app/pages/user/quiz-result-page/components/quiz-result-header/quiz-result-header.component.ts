import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProgressBarComponent } from '../../../../../shared/components/progress-bar/progress-bar.component';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { QuizCompletedSummary } from '../../interfaces/quiz-completed-summary.interface';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';

import { platformMessages } from '../../../../../utils/constants';
import { defaultQuizCompletedSummary } from '../../configs/default-quiz-completed-summary.configs';
import { QuizResultService } from '../../../../../services/user/quiz-result.service';
import { Subject, takeUntil } from 'rxjs';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { getTagConfigWithCustomization } from '../../../../../utils/quiz-crud-common-functions.utils';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { notAttemptedTagConfig } from '../../configs/quiz-result-tag.configs';

@Component({
  selector: 'app-quiz-result-header',
  imports: [MatIconModule, ProgressBarComponent, TagComponent],
  templateUrl: './quiz-result-header.component.html',
  styleUrls: ['./quiz-result-header.component.scss'],
})
export class QuizResultHeaderComponent implements OnInit, OnDestroy {
  @Input() quizId!: number; // Receive quizId from parent

  quizSummary: QuizCompletedSummary = defaultQuizCompletedSummary;
  gradeTagConfig: TagInputConfig = notAttemptedTagConfig;

  private readonly snackbar = inject(SnackbarService);
  private readonly quizService = inject(QuizResultService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.quizId) {
      this.loadQuizSummary(this.quizId);
    }
  }

  loadQuizSummary(quizId: number) {
    this.quizService
      .getQuizSummary(quizId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<QuizCompletedSummary>) => {
          this.quizSummary = res.data ?? defaultQuizCompletedSummary;
          this.gradeTagConfig = getTagConfigWithCustomization(this.quizSummary.grade, true);
        },
        error: () => {
          this.snackbar.showError(
            platformMessages.errorMessage,
            platformMessages.failedLoadQuizResultSummary,
          );
          this.quizSummary = defaultQuizCompletedSummary;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
