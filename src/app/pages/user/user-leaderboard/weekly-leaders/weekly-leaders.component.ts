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
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    } else {
      return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
    }
  }

  getInitialsColorClass(name: string): string {
    if (!name) return 'bg-avatar-0';
    const colorsCount = 12;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorsCount;
    return `bg-avatar-${index}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
