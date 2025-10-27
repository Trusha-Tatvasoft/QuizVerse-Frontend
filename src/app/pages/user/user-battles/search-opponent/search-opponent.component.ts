import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import { cancelSearchButtonConfig } from '../configs/search-opponent.config';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../utils/constants';
import { BattleHubService } from '../../../../services/user/user-battles/battle-hub.service';
import {
  BattleData,
  BattleStartDetails,
  PlayerProfileDTO,
} from '../interface/search-opponent.interface';
import { environment } from '../../../../../environments/environment.dev';
import { Navigations } from '../../../../shared/enums/navigation';
import { CheatPreventionService } from '../../../../shared/service/cheat-prevention/cheat-prevention.service';

@Component({
  selector: 'app-search-opponent',
  standalone: true,
  imports: [CommonModule, OutlineButtonComponent, MatIcon],
  templateUrl: './search-opponent.component.html',
  styleUrls: ['./search-opponent.component.scss'],
})
export class SearchOpponentComponent implements OnInit, OnDestroy {
  cancelSearchButtonConfig = cancelSearchButtonConfig;
  searchSeconds = 0;
  battleId: number | null = null;
  opponent: PlayerProfileDTO | null = null;
  battleStartDetails: BattleStartDetails | null = null;
  battleData: BattleData = {
    battleName: 'Math Champions',
    battleCategory: 'Mathematics',
    battleDifficulty: 'Medium',
    battleXp: 150,
  };
  isSearchTimeOut: boolean = false;
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
        this.cancelSearch();
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

  private async connectToHub(): Promise<void> {
    try {
      await this.battleHub.connect();

      // React to matchmaking events
      this.battleHub.onMatchFound
        .pipe(takeUntil(this.destroy$))
        .subscribe((result: PlayerProfileDTO) => {
          if (result) {
            this.stopTimer();
            this.opponent = {
              fullName: result.fullName,
              userId: result.userId,
              currentLevel: result.currentLevel,
              profilePic: result.profilePic
                ? `${environment.imageBaseUrl}/${result.profilePic}`
                : '',
              userName: result.userName,
              winRate: result.winRate,
            };
            this.battleHub.onBattleStarted
              .pipe(takeUntil(this.destroy$))
              .subscribe((result: BattleStartDetails) => {
                if (result) {
                  this.battleStartDetails = result;
                }
                // Navigate to battle page when matched
                if (this.battleId && this.battleStartDetails) {
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
                        opponent: this.opponent,
                      },
                    },
                  );
                }
              });
          }
        });

      this.battleHub.onSearching.pipe(takeUntil(this.destroy$)).subscribe();
    } catch (error) {
      this.snackbar.showError(
        error instanceof Error && error.message
          ? error.message
          : platformMessages.matchMakingFailed,
      );
    }
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

        // Start matchmaking only after connection is established
        if (this.battleHub.connected) {
          this.battleHub.startMatchmaking(this.battleId);
        } else {
          this.battleHub.connect().then(() => {
            this.battleHub.startMatchmaking(this.battleId!);
          });
        }
      } else {
        throw new Error(platformMessages.invalideBattleId);
      }
    } catch {
      this.snackbar.showError(platformMessages.invalideBattleId);
      this.battleId = null;
      this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]);
    }
  }
}
