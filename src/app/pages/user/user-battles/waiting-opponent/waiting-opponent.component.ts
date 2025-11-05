import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { Subject, takeUntil } from 'rxjs';
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
import { IncomingBattleRequest } from '../../../../shared/interfaces/incoming-battle-request.interface';

@Component({
  selector: 'app-waiting-opponet',
  imports: [MatIconModule],
  templateUrl: './waiting-opponent.component.html',
  styleUrls: ['./waiting-opponent.component.scss'],
})
export class WaitingOpponetComponent implements OnInit {
  cancelSearchButtonConfig = cancelSearchButtonConfig;
  searchSeconds = 0;
  battleId: number | null = null;
  isSearchTimeOut: boolean = false;
  battleStartDetails: BattleStartDetails | null = null;
  opponent: PlayerProfileDTO | null = null;
  battleData: BattleData;

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
      this.startSearchTimer();
    });
    await this.connectToHub();
    this.decodeRouteId();
  }

  private startSearchTimer(): void {
    this.searchSeconds = 0;

    this.timerInterval = setInterval(() => {
      this.searchSeconds++;

      if (this.searchSeconds >= 30) {
        this.isSearchTimeOut = true;
        this.stopTimer();
        this.snackbar.showInfo('No opponent found. Redirecting to dashboard...');

        setTimeout(() => {
          this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]);
        }, 1500);
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
      if (!this.battleHub.connected) await this.battleHub.connect();

      this.battleHub.onRequestAccepted
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: { receiverId: number; battleRequest: IncomingBattleRequest }) => {
          const request = data.battleRequest;
          this.snackbar.showSuccess(`${request.senderFullName} accepted the battle request!`);
        });

      this.battleHub.onRequestAcceptedConfirmation
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: { senderId: number; battleRequest: IncomingBattleRequest }) => {
          const request = data.battleRequest;
          // Show snackbar
          this.snackbar.showSuccess(`${request.senderFullName} accepted the battle request!`);
        });

      this.battleHub.onBattleStarted
        .pipe(takeUntil(this.destroy$))
        .subscribe((result: BattleStartDetails) => {
          if (result) {
            this.battleStartDetails = result;
            if (this.battleId) {
              setTimeout(() => this.openFullscreen(), 0);
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
      this.snackbar.showError(
        error instanceof Error && error.message
          ? error.message
          : platformMessages.matchMakingFailed,
      );
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
      const urlDecoded = decodeURIComponent(encodedId);
      const base64Decoded = atob(urlDecoded);
      const asNumber = Number(base64Decoded);

      if (!isNaN(asNumber) && asNumber > 0) {
        this.battleId = asNumber;
      } else {
        throw new Error(platformMessages.invalideBattleId);
      }
    } catch {
      this.snackbar.showError(platformMessages.invalideBattleId);
      this.battleId = null;
      this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]);
    }
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
}
