import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { Subject, takeUntil } from 'rxjs';
import { platformMessages } from '../../../../utils/constants';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { WeeklyLeaderEntry } from '../interfaces/user-leaderboard.interface';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { ScrollWindowComponent } from '../../../../shared/components/scroll-window/scroll-window.component';
import {
  globalGetInitials,
  globalGetInitialsColorClass,
} from '../../../../utils/get-profile-initials.utils';

@Component({
  selector: 'app-weekly-leaders',
  imports: [CommonModule, MatIcon, ScrollWindowComponent],
  templateUrl: './weekly-leaders.component.html',
  styleUrl: './weekly-leaders.component.scss',
})
export class WeeklyLeadersComponent {
  leaderboard: WeeklyLeaderEntry[] = [];

  private readonly snackbar = inject(SnackbarService);
  private readonly leaderboardService = inject(LeaderboardService);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.fetchWeeklyLeaderboard();
  }

  fetchWeeklyLeaderboard(): void {
    this.leaderboardService
      .getWeeklyLeaderboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<WeeklyLeaderEntry[]>) => {
          this.leaderboard = res.data;
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  getInitials(name: string): string {
    return globalGetInitials(name);
  }

  getInitialsColorClass(name: string): string {
    return globalGetInitialsColorClass(name);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
