import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { BattleHubService } from '../../../../services/user/user-battles/battle-hub.service';
import { CheatPreventionService } from '../../../../shared/service/cheat-prevention/cheat-prevention.service';
import { platformMessages } from '../../../../utils/constants';
import { Navigations } from '../../../../shared/enums/navigation';
import { cancelSearchButtonConfig } from '../configs/search-opponent.config';
import {
  BattleData,
  BattleStartDetails,
  PlayerProfileDTO,
} from '../interface/search-opponent.interface';

@Component({
  selector: 'app-waiting-opponent',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './waiting-opponent.component.html',
  styleUrl: './waiting-opponent.component.scss',
})
export class WaitingOpponentComponent implements OnInit, OnDestroy {
  cancelSearchButtonConfig = cancelSearchButtonConfig;
  searchSeconds = 0;
  battleId: number | null = null;
  isSearchTimeOut = false;
  battleStartDetails: BattleStartDetails | null = null;
  opponent: PlayerProfileDTO | null = null;
  battleData!: BattleData;

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly snackbar = inject(SnackbarService);
  private readonly battleHub = inject(BattleHubService);
  private readonly cheatPrevention = inject(CheatPreventionService);

  async ngOnInit(): Promise<void> {
    this.cheatPrevention.startMonitoring();
    this.cheatPrevention.violations$.pipe(takeUntil(this.destroy$)).subscribe((reason) => {
      if (reason === platformMessages.openedDeveloperTools) {
        this.snackbar.showError(reason);
      }
    });

    await this.connectToHub();
    this.decodeRouteId();
    this.startSearchTimer();
  }

  cancelSearch(): void {
    if (this.battleId && this.battleId > 0) {
      this.battleHub.cancelMatchmaking(this.battleId);
    }
    if (!this.isSearchTimeOut) this.snackbar.showInfo(platformMessages.cancelSearch);
    setTimeout(() => {
      this.stopTimer();
      this.destroy$.next();
      this.destroy$.complete();
      this.battleHub.stopConnection();
      this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]);
    }, 100);
  }

  openFullscreen(): void {
    const elem = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      msRequestFullscreen?: () => void;
    };
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startSearchTimer(): void {
    this.timerInterval = setInterval(() => {
      this.searchSeconds++;
      if (this.searchSeconds >= 30) {
        this.snackbar.showWarning(platformMessages.searchTimeOut);
        this.isSearchTimeOut = true;
        this.cancelSearch();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private async connectToHub(): Promise<void> {
    try {
      if (!this.battleHub.connected) {
        await this.battleHub.connect();
      }

      this.battleHub.onRequestAccepted
        .pipe(takeUntil(this.destroy$))
        .subscribe(({ battleRequest }) => {
          this.snackbar.showSuccess(`${battleRequest.senderFullName} accepted the battle request!`);
        });

      this.battleHub.onRequestAcceptedConfirmation
        .pipe(takeUntil(this.destroy$))
        .subscribe(({ battleRequest }) => {
          this.snackbar.showSuccess(`${battleRequest.senderFullName} accepted the battle request!`);
        });

      this.battleHub.onBattleStarted
        .pipe(takeUntil(this.destroy$))
        .subscribe((result: BattleStartDetails) => {
          if (result) {
            this.stopTimer();
            this.battleStartDetails = result;

            if (this.battleId) {
              this.openFullscreen();
              this.router.navigate(
                [
                  Navigations.User,
                  Navigations.Battles,
                  Navigations.BattleList,
                  Navigations.FoundOpponent,
                  btoa(encodeURIComponent(this.battleId.toString())),
                ],
                {
                  state: {
                    battleStartDetails: this.battleStartDetails,
                    opponent: result.playerProfile,
                  },
                },
              );
            }
          }
        });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : platformMessages.matchMakingFailed;
      this.snackbar.showError(message);
    }
  }

  private decodeRouteId(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    const state = history.state;
    if (!encodedId) {
      this.snackbar.showError(platformMessages.invalideBattleId);
      this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]);
      return;
    }
    if (state?.battleData) {
      this.battleData = state.battleData;
    }
    try {
      const decoded = Number(atob(decodeURIComponent(encodedId)));
      if (!isNaN(decoded) && decoded > 0) {
        this.battleId = decoded;
      } else {
        throw new Error(platformMessages.invalideBattleId);
      }
    } catch {
      this.snackbar.showError(platformMessages.invalideBattleId);
      this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]);
    }
  }
}
