import { Component, inject, OnInit } from '@angular/core';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { MatIconModule } from '@angular/material/icon';
import { TextButtonComponent } from '../../../../../shared/components/text-button/text-button.component';
import { viewAllButtonConfig } from '../../configs/dashboard-buttons.config';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';
import { UserDashboardService } from '../../../../../services/user/user-dashboard/user-dashboard.service';
import { Navigations } from '../../../../../shared/enums/navigation';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../../utils/constants';
import { QuizResult, QuizResultWithTag } from '../../interfaces/quiz-result.interface';
import { createDifficultyTag } from '../../../../../utils/types/difficulty-tag.type';

@Component({
  selector: 'app-recent-quiz-result',
  standalone: true,
  imports: [TagComponent, MatIconModule, TextButtonComponent],
  templateUrl: './recent-quiz-result.component.html',
  styleUrl: './recent-quiz-result.component.scss',
})
export class RecentQuizResultComponent implements OnInit {
  quizzesWithTags: QuizResultWithTag[] = [];
  viewAllButtonConfig = viewAllButtonConfig;

  private readonly snackBarService = inject(SnackbarService);
  private readonly dashboardService = inject(UserDashboardService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadRecentQuizzes();
  }

  private loadRecentQuizzes(): void {
    this.dashboardService.getRecentQuizzes(false).subscribe({
      next: (res: ApiResponse<QuizResult[]>) => {
        if (res.result) {
          this.quizzesWithTags = res.data.map((q) => ({
            ...q,
            tag: createDifficultyTag(q.difficultyLevel), // ✅ using utility
          }));
        }
      },
      error: () => {
        this.snackBarService.showError(platformMessages.errorTitle, platformMessages.errorMessage);
      },
    });
  }

  viewAll(): void {
    const route = `${Navigations.Profile}`;
    this.router.navigate([route], { queryParams: { tab: 1 } });
  }
}
