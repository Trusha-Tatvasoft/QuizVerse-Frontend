import { Component, inject, Input } from '@angular/core';
import { ProgressBarComponent } from '../../../../../shared/components/progress-bar/progress-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { RankProgress } from '../../interfaces/rank-progress.interface';
import { UserDashboardService } from '../../../../../services/user/user-dashboard/user-dashboard.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { Subject, takeUntil } from 'rxjs';
import { platformMessages } from '../../../../../utils/constants';
import { defaultRankData } from '../../configs/default-rank-data.config';

@Component({
  selector: 'app-rank-progress-card',
  imports: [[ProgressBarComponent, MatIconModule]],
  templateUrl: './rank-progress-card.component.html',
  styleUrls: ['./rank-progress-card.component.scss'],
})
export class RankProgressCardComponent {
  private readonly userDashboardService = inject(UserDashboardService);
  private readonly snackBarService = inject(SnackbarService);
  private readonly destroy$ = new Subject<void>();

  rankData: RankProgress = defaultRankData;

  ngOnInit(): void {
    this.loadRankProgressData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
