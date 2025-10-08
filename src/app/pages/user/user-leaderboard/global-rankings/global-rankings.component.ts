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
import {
  globalGetInitials,
  globalGetInitialsColorClass,
} from '../../../../utils/get-profile-initials.utils';

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
