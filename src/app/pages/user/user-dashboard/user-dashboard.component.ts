import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  UserDashboardData,
  UserPerformanceSummary,
} from './interfaces/user-performance-summary.interface';
import { platformMessages, valueColor } from '../../../utils/constants';
import { Subject, takeUntil } from 'rxjs';
import { UserDashboardService } from '../../../services/user/user-dashboard/user-dashboard.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { defaultBannerData, userDashboardHeaderConfig } from './configs/default-banner-data.config';
import { userPerformanceCardConfig } from './configs/user-performace-card.config';
import { WelcomeBannerComponent } from './component/welcome-banner/welcome-banner.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { RankProgressCardComponent } from './component/rank-progress-card/rank-progress-card.component';
import { BattleRequestComponent } from './component/battle-request/battle-request.component';
import { RecentQuizResultComponent } from './component/recent-quiz-result/recent-quiz-result.component';
import { AchievementComponent } from './component/achievement/achievement.component';
import { FeaturedQuizComponent } from './component/featured-quiz/featured-quiz.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    WelcomeBannerComponent,
    CardComponent,
    RankProgressCardComponent,
    FeaturedQuizComponent,
    RecentQuizResultComponent,
    AchievementComponent,
    BattleRequestComponent,
    PageHeaderComponent,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  quizStatsConfigs: CardInputConfig[] = [];
  bannerData = defaultBannerData;

  userDashboardConfig = userDashboardHeaderConfig;

  private readonly userDashboardService = inject(UserDashboardService);
  private readonly snackBarService = inject(SnackbarService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.userDashboardService
      .getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: UserDashboardData) => {
          this.bannerData = data.banner;
          this.quizStatsConfigs = this.mapSummaryToCards(data.card);
        },
        error: () => {
          this.snackBarService.showError(
            platformMessages.errorTitle,
            platformMessages.errorMessage,
          );
        },
      });
  }

  private mapSummaryToCards(summary: UserPerformanceSummary): CardInputConfig[] {
    return Object.keys(summary).map((key) => {
      const stat = summary[key as keyof UserPerformanceSummary];
      const config = userPerformanceCardConfig[key as keyof typeof userPerformanceCardConfig];

      return {
        ...config,
        value: stat,
        subtitle: '',
        valueColor: valueColor,
        subtitleColor: valueColor,
      };
    });
  }
}
