import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { TextButtonComponent } from '../../../../../shared/components/text-button/text-button.component';
import {
  loadMoreButtonConfig,
  playButtonConfig,
  showLessButtonConfig,
} from '../../configs/dashboard-buttons.config';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';
import { UserDashboardService } from '../../../../../services/user/user-dashboard/user-dashboard.service';
import { FeaturedQuizList, FeaturedQuizWithTag } from '../../interfaces/featured-quiz.interface';
import { Subject, takeUntil } from 'rxjs';
import { createDifficultyTag } from '../../../../../utils/types/difficulty-tag.type';
import { platformMessages } from '../../../../../utils/constants';

@Component({
  selector: 'app-featured-quiz',
  standalone: true,
  imports: [MatIconModule, CommonModule, FilledButtonComponent, TagComponent, TextButtonComponent],
  templateUrl: './featured-quiz.component.html',
  styleUrls: ['./featured-quiz.component.scss'],
})
export class FeaturedQuizComponent implements OnInit {
  quizzesWithTags: FeaturedQuizWithTag[] = [];
  hasMore: boolean = false;
  loading: boolean = false;
  errorMessage: string | null = null;
  private currentBatch: number = 1;

  loadMoreButtonConfig = loadMoreButtonConfig;
  showLessButtonConfig = showLessButtonConfig;
  playButtonConfig = playButtonConfig;

  private readonly dashboardService = inject(UserDashboardService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadFeaturedQuizzes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFeaturedQuizzes(batchNumber: number = 1): void {
    this.loading = true;
    this.errorMessage = null;

    this.dashboardService
      .getFeaturedQuizzes(batchNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<FeaturedQuizList>) => {
          const data = res.data;

          const mapped = data.quizzes.map((q) => ({
            ...q,
            tag: createDifficultyTag(q.difficultyLevel),
          }));

          if (batchNumber === 1) {
            this.quizzesWithTags = mapped;
          } else {
            this.quizzesWithTags = [...this.quizzesWithTags, ...mapped];
          }

          this.hasMore = data.hasMore;
          this.currentBatch = batchNumber;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || platformMessages.errorMessage;
          this.loading = false;
        },
      });
  }

  handleFooterAction(): void {
    if (this.hasMore) {
      this.loadFeaturedQuizzes(this.currentBatch + 1);
    } else {
      this.quizzesWithTags = this.quizzesWithTags.slice(0, 5);
      this.currentBatch = 1;
      this.hasMore = true; // allow "Load More" again
    }
  }
}
