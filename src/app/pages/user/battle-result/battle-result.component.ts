import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { BattleResult } from './interfaces/battle-result.interface';
import { mapUserBattleResultToBattleResult } from './battle-result.mapper';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../utils/constants';
import { UserBattlesService } from '../../../services/user/user-battles/user-battles.service';
import { BattleHubService } from '../../../services/user/user-battles/battle-hub.service';
import { BattleCompletionResult } from './interfaces/battle-completion.interface';
import { Navigations } from '../../../shared/enums/navigation';
import { backToDashboardButtonConfig } from '../quiz-result-page/configs/quiz-result-buttons.configs';

@Component({
  selector: 'app-battle-result',
  imports: [CommonModule, MatIconModule],
  templateUrl: './battle-result.component.html',
  styleUrls: ['./battle-result.component.scss'],
})
export class BattleResultComponent {
  battleResult!: BattleResult;
  decodedBattleId!: number;
  timeLeft = 10;
  loading = true;
  imageError = false;
  dashboardButtonConfig = backToDashboardButtonConfig;

  private timerInterval!: ReturnType<typeof setInterval>;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);
  private readonly userBattleService = inject(UserBattlesService);
  private readonly battleHubService = inject(BattleHubService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.decodeRouteId();
    if (this.decodedBattleId > 0) {
      this.checkInitialBattleStatus();
      this.setupBattleHub();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.destroy$.next();
    this.destroy$.complete();
    this.battleHubService.cleanupBattleSubjects();
  }

  private decodeRouteId(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (!encodedId) {
      this.snackbar.showError(platformMessages.errorTitle, platformMessages.invalidBattleId);
      return;
    }

    try {
      const urlDecoded = decodeURIComponent(encodedId);
      const base64Decoded = atob(urlDecoded);
      const battleId = Number(base64Decoded);

      if (!isNaN(battleId)) {
        this.decodedBattleId = battleId;
      } else {
        this.snackbar.showError(platformMessages.errorTitle, platformMessages.invalidBattleId);
      }
    } catch {
      this.snackbar.showError(platformMessages.errorTitle, platformMessages.invalidBattleId);
    }
  }

  private checkInitialBattleStatus(): void {
    this.userBattleService
      .getBattleResult(this.decodedBattleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.data) {
            // Battle ended → stay in this component and display result
            this.loading = false;
            this.battleResult = mapUserBattleResultToBattleResult(res.data);
            this.startTimer();
          } else {
            // Battle not ended → redirect to waiting component
            this.navigateToWaitingPage();
          }
        },
        error: (err) => {
          // If server says "battle is running" → redirect
          if (err.status === 400 && err.error?.message?.includes('running')) {
            this.navigateToWaitingPage();
          } else {
            this.snackbar.showError(platformMessages.errorTitle, platformMessages.serverErrorTitle);
          }
        },
      });
  }

  private setupBattleHub(): void {
    if (!this.battleHubService.connected) {
      this.battleHubService.connect();
    }

    this.battleHubService.onBattleEnded
      .pipe(takeUntil(this.destroy$))
      .subscribe((battleCompletion: BattleCompletionResult) => {
        if (!battleCompletion) return;

        if (battleCompletion.battleStatus > 0) {
          // Battle ended → reload result in this component
          this.snackbar.showSuccess(
            platformMessages.successTitle,
            platformMessages.battleEndedMessage,
          );
          this.fetchBattleResult();
        } else {
          // Battle not completed → redirect to waiting page
          this.navigateToWaitingPage();
        }
      });
  }

  private fetchBattleResult(): void {
    this.userBattleService
      .getBattleResult(this.decodedBattleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.data) {
            this.loading = false;
            this.battleResult = mapUserBattleResultToBattleResult(res.data);
            this.startTimer();
          } else {
            this.navigateToWaitingPage();
          }
        },
        error: () => {
          this.snackbar.showError(platformMessages.errorTitle, platformMessages.serverErrorTitle);
        },
      });
  }

  private navigateToWaitingPage(): void {
    const encodedId = encodeURIComponent(btoa(this.decodedBattleId.toString()));
    this.router.navigate([
      `${Navigations.User}/${Navigations.Battles}/${Navigations.BattleList}/${Navigations.WaitingBattleResult}/${encodedId}`,
    ]);
  }

  startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.stopTimer();
        this.router.navigate([`${Navigations.User}/${Navigations.Dashboard}`]);
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  formatTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  getInitials(fullName: string): string {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
