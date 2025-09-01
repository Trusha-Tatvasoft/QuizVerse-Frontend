import { Component, inject, OnInit } from '@angular/core';
import { UserLeaderboardStats } from '../interfaces/user-leaderboard.interface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { Subject, takeUntil } from 'rxjs';
import { defaultUserLeaderboardStats } from '../configs/user-leaderboard.configs';
import { platformMessages } from '../../../../utils/constants';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';

@Component({
  selector: 'app-global-leaderboard-card',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './global-leaderboard-card.component.html',
  styleUrl: './global-leaderboard-card.component.scss',
})
export class GlobalLeaderboardCardComponent implements OnInit {
  // Inject services
  leaderboardsService = inject(LeaderboardService);
  snackbar = inject(SnackbarService);

  // configs
  userLeaderboardStats: UserLeaderboardStats = defaultUserLeaderboardStats;

  // Private reactive helpers
  private readonly destroy$ = new Subject<void>();

  /**
   * Fetches the current user's leaderboard statistics from the API.
   */
  ngOnInit(): void {
    this.getUserLeaderboardStats();
  }

  /**
   * Completes the `destroy` Subject to clean up all active subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Fetches the current user's leaderboard statistics from the backend.
   */
  private getUserLeaderboardStats(): void {
    this.leaderboardsService
      .getUserLeaderboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.data) {
            this.userLeaderboardStats = res.data;
          }
        },
        error: (err) => {
          this.userLeaderboardStats = defaultUserLeaderboardStats;
          const message = err?.error?.message || platformMessages.errorMessage;
          this.snackbar.showError(`${platformMessages.errorTitle} ${err.statusCode}`, message);
        },
      });
  }
}
