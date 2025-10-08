import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { UserBattleLeaderboardData } from '../interface/user-battles.interface';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { CommonModule } from '@angular/common';
import { platformMessages } from '../../../../utils/constants';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { UserBattlesService } from '../../../../services/user/user-battles/user-battles.service';
import { ScrollWindowComponent } from '../../../../shared/components/scroll-window/scroll-window.component';

@Component({
  selector: 'app-battles-leaderboard',
  imports: [MatIcon, CommonModule, ScrollWindowComponent],
  templateUrl: './battles-leaderboard.component.html',
  styleUrls: [
    './battles-leaderboard.component.scss',
    '../../user-leaderboard/global-rankings/global-rankings.component.scss',
  ],
})
export class BattlesLeaderboardComponent {
  leaderboard: UserBattleLeaderboardData[] = [];
  runFirstTime: boolean = true;

  private readonly snackbar = inject(SnackbarService);
  private readonly userBattlesService = inject(UserBattlesService);
  private readonly updateBattleResults$ = this.userBattlesService.updateBattleResultsObservable$;

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.fetchUsersBattleLeaderboard();

    this.updateBattleResults$
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((update) => {
        if (!this.runFirstTime) {
          if (update) {
            setTimeout(() => {
              this.fetchUsersBattleLeaderboard();
              this.userBattlesService.updateBattleResults$.next(false);
            }, 100);
          }
        }
        this.runFirstTime = false;
      });
  }

  fetchUsersBattleLeaderboard(): void {
    this.userBattlesService
      .getBattleLeaderboardList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<UserBattleLeaderboardData[]>) => {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
