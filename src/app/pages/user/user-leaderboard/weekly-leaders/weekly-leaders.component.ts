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
    this.fetchUsersBattleLeaderboard();
  }

  fetchUsersBattleLeaderboard(): void {
    this.leaderboardService
      .getWeeklyLeaderboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<WeeklyLeaderEntry[]>) => {
          this.leaderboard = res.data;
        },
        error: (err) => {
          const message = err?.error?.message || platformMessages.errorMessage;
          this.snackbar.showError(`${platformMessages.errorTitle} ${err.statusCode}`, message);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  onImageError(entry: WeeklyLeaderEntry) {
    entry.profilePic = '';
  }
}
