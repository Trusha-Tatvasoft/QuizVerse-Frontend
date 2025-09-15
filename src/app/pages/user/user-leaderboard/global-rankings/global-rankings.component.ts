import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LeaderboardEntry } from '../interfaces/user-leaderboard.interface';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { MatIcon } from '@angular/material/icon';
import { environment } from '../../../../../environments/environment.dev';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../utils/constants';
import { ScrollWindowComponent } from '../../../../shared/components/scroll-window/scroll-window.component';

@Component({
  selector: 'app-global-rankings',
  imports: [CommonModule, MatIcon, ScrollWindowComponent],
  templateUrl: './global-rankings.component.html',
  styleUrl: './global-rankings.component.scss',
})
export class GlobalRankingsComponent {
  leaderboard: LeaderboardEntry[] = [];

  private readonly leaderboardService = inject(LeaderboardService);
  private readonly snackbar = inject(SnackbarService);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.fetchLeaderboard();
  }

  fetchLeaderboard(): void {
    this.leaderboardService
      .getGlobalLeaderboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const raw = res?.data ?? [];
          this.leaderboard = raw.map((u) => ({
            ...u,
            profilePic: u.profilePic ? `${environment.imageBaseUrl}/${u.profilePic}` : '',
          }));
        },
        error: (err) => {
          this.leaderboard = [];

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
