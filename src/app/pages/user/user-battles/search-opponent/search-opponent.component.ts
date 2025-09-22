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
  MatchmakingResultDTO,
  PlayerProfileDTO,
} from '../interface/search-opponent.interface';
import { environment } from '../../../../../environments/environment.dev';
import { Navigations } from '../../../../shared/enums/navigation';

@Component({
  selector: 'app-search-opponent',
  standalone: true,
  imports: [CommonModule, OutlineButtonComponent, MatIcon],
  templateUrl: './search-opponent.component.html',
  styleUrls: ['./search-opponent.component.scss'],
})
export class SearchOpponentComponent implements OnInit, OnDestroy {
  isSearching = true;
  cancelSearchButtonConfig = cancelSearchButtonConfig;
  searchSeconds = 0;
  battleId: number | null = null;
  opponent: MatchmakingResultDTO['opponentProfile'] | null = null;
  isImageError: boolean = false;
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

  async ngOnInit(): Promise<void> {
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
      this.isSearching = false;
      this.router.navigate([Navigations.User, Navigations.Battles]);
    }, 100);
  }

  imageError() {
    this.isImageError = true;
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.destroy$.next();
    this.destroy$.complete();
    this.battleHub.stopConnection();
  }

  private async connectToHub(): Promise<void> {
    try {
      await this.battleHub.connect();

      // React to matchmaking events
      this.battleHub.onMatchFound
        .pipe(takeUntil(this.destroy$))
        .subscribe((result: PlayerProfileDTO) => {
          if (result) {
            this.isSearching = false;
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

            // Navigate to battle page when matched
            if (this.battleId) {
              setTimeout(() => {
                this.router.navigate([Navigations.User, Navigations.Battles]); // Put Battle instructions/battle
              }, 2000);
            }
          }
        });

      this.battleHub.onSearching.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.isSearching = true;
      });
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
    const navigation = this.router.getCurrentNavigation();
    if (!encodedId) {
      this.snackbar.showError(platformMessages.invalideBattleId);
      this.router.navigate(['/battles']);
      return;
    }
    if (navigation?.extras.state) {
      if (navigation.extras.state['battleData']) {
        this.battleData = navigation.extras.state['battleData'];
      }
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
      this.router.navigate(['/battles']);
    }
  }
}
