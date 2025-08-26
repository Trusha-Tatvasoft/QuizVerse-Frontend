import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { WelcomeBannerComponent } from './components/welcome-banner/welcome-banner.component';
import { userPerformanceCardConfig } from './configs/user-dashboard.config';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import {
  UserDashboard,
  UserPerformanceSummary,
} from './interfaces/user-performance-summary.interface';
import { CardColor } from '../../../utils/types/card-component.type';
import { CardComponent } from '../../../shared/components/card/card.component';
import { RankProgressCardComponent } from './components/rank-progress-card/rank-progress-card.component';
import { platformMessages } from '../../../utils/constants';
import { UserDashboardService } from '../../../services/user/user-dashboard/user-dashboard.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { Subject, takeUntil } from 'rxjs';
import { RankProgress } from './interfaces/rank-progress.interface';

@Component({
  selector: 'app-user-dashboard',
  imports: [WelcomeBannerComponent, CardComponent, RankProgressCardComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  quizStatsConfigs: CardInputConfig[] = [];
  bannerData = { userName: 'user', currentRank: 0 };
  valueColor: CardColor = 'black';

  rankData: RankProgress = {
    currentRank: '',
    nextRank: '',
    xpNeeded: 0,
    progressPercent: 0,
  };

  private readonly userDashboardService = inject(UserDashboardService);
  private readonly snackBarService = inject(SnackbarService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRankProgressData();
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
        next: (data: UserDashboard) => {
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
        title: config.title,
        value: stat,
        subtitle: '',
        valueColor: this.valueColor,
        subtitleColor: this.valueColor,
        icon: config.icon,
        iconColor: config.iconColor,
      };
    });
  }

  private loadRankProgressData(): void {
    this.userDashboardService
      .getRankProgress()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.rankData = data;
        },
        error: () => {
          this.snackBarService.showError(
            platformMessages.errorTitle,
            platformMessages.errorMessage,
          );
        },
      });
  }
}
