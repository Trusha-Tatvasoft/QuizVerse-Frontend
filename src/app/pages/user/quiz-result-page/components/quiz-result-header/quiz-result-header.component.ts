import { Component, Input, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProgressBarComponent } from '../../../../../shared/components/progress-bar/progress-bar.component';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { QuizCompletedSummary } from '../../interfaces/quiz-completed-summary.interface';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';

import { platformMessages } from '../../../../../utils/constants';
import { defaultQuizCompletedSummary } from '../../configs/default-quiz-completed-summary.interface';
import { QuizResultService } from '../../../../../services/user/quiz-result.service';

@Component({
  selector: 'app-quiz-result-header',
  imports: [MatIconModule, ProgressBarComponent],
  templateUrl: './quiz-result-header.component.html',
  styleUrls: ['./quiz-result-header.component.scss'],
})
export class QuizResultHeaderComponent implements OnInit {
  @Input() quizId!: number; // Receive quizId from parent

  quizSummary: QuizCompletedSummary = defaultQuizCompletedSummary;

  private readonly snackbar = inject(SnackbarService);
  private readonly quizService = inject(QuizResultService);

  ngOnInit(): void {
    if (this.quizId) {
      this.loadQuizSummary(this.quizId);
    }
  }

  loadQuizSummary(quizId: number) {
    this.quizService.getQuizSummary(quizId).subscribe({
      next: (res: ApiResponse<QuizCompletedSummary>) => {
        this.quizSummary = res.data ?? defaultQuizCompletedSummary;
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
}
