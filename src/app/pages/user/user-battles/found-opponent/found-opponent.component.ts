import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { BattleStartDetails, PlayerProfileDTO } from '../interface/search-opponent.interface';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  autoSubmitBattleMessage,
  battleIdStorageKey,
  platformMessages,
} from '../../../../utils/constants';
import { Navigations } from '../../../../shared/enums/navigation';
import { DisableQuizShortcutsDirective } from '../../../../shared/Directives/disable-quiz-shortcuts.directive';
import { CheatPreventionService } from '../../../../shared/service/cheat-prevention/cheat-prevention.service';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { resumeBattleDialog } from '../configs/play-battle.config';
import { BattleHubService } from '../../../../services/user/user-battles/battle-hub.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-found-opponent',
  imports: [CommonModule, MatIcon, DisableQuizShortcutsDirective],
  templateUrl: './found-opponent.component.html',
  styleUrl: './found-opponent.component.scss',
})
export class FoundOpponentComponent {
  battleId: number | null = null;
  opponent: PlayerProfileDTO | null = null;
  isImageError: boolean = false;
  reloadAttempted = false;
  battleStartDetails: BattleStartDetails | null = null;
  battleAttemptId: number | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly snackbar = inject(SnackbarService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly cheatPrevention = inject(CheatPreventionService);
  private readonly battleHub = inject(BattleHubService);
  private readonly BATTLE_ATTEMPT_ID = battleIdStorageKey;

  private encodedId: string | null;

  ngOnInit(): void {
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    window.addEventListener('pageshow', this.pageShowHandler);
    this.decodeRouteId();
    this.redirectToBattle();

    this.cheatPrevention.startMonitoring();
    this.cheatPrevention.violations$.pipe(takeUntil(this.destroy$)).subscribe((reason) => {
      this.completeBattle(reason);
    });
  }

  redirectToBattle(): void {
    if (!this.reloadAttempted) {
      if (this.battleId && this.battleId > 0) {
        const battleId = this.battleId!.toString();
        setTimeout(() => {
          this.router.navigate(
            [
              Navigations.User,
              Navigations.Battles,
              Navigations.BattleList,
              Navigations.BattleInstruction,
              btoa(encodeURIComponent(battleId)),
            ],
            {
              state: {
                battleId: btoa(encodeURIComponent(battleId)),
              },
            },
          ); // put battle instrction route
        }, 2000);
      } else {
        this.snackbar.showError(platformMessages.invalideBattleId);
        this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]);
      }
    } else {
      const battleId = this.battleId!.toString();
      if (this.battleAttemptId !== null) {
        const battleAttemptId = this.battleAttemptId!.toString();
        setTimeout(() => {
          this.router.navigate(
            [
              Navigations.User,
              Navigations.Battles,
              Navigations.BattleAttempt,
              btoa(encodeURIComponent(battleAttemptId)),
            ],
            {
              state: {
                battleId: btoa(encodeURIComponent(battleId)),
              },
            },
          ); // put battle Question route
        }, 2000);
      } else {
        this.snackbar.showError('Could not resume the battle. Please start a new battle.');
        this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList], {
          state: {
            battleId: btoa(encodeURIComponent(battleId)),
          },
        }); // put result route
      }
    }
  }

  completeBattle(reason: string): void {
    this.snackbar.showError(autoSubmitBattleMessage(reason));
    this.closeFullscreen();
    if (this.battleHub.connected) {
      this.battleHub.interruptBattle(this.battleAttemptId!);
    } else {
      this.battleHub.connect().then(() => {
        this.battleHub.interruptBattle(this.battleAttemptId!);
      });
    }
    this.battleHub.onPlayerInterrupted.pipe(takeUntil(this.destroy$)).subscribe(({ userId }) => {
      const myId = +(this.authService.getCurrentUserId() ?? 0);
      if (userId !== myId) {
        this.snackbar.showInfo(platformMessages.opponentLeft);
      }
    });

    this.battleHub.onBattleEndedForParticularPlayer
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ userId }) => {
        const myId = +(this.authService.getCurrentUserId() ?? 0);
        if (userId !== myId) {
          setTimeout(() => {
            this.snackbar.showInfo(platformMessages.opponentBattleEnded);
          }, 1500);
        }
      });
  }

  resumeBattle(): void {
    this.openFullscreen();
    this.reconnectToHub();
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

  closeFullscreen(): void {
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
      msExitFullscreen?: () => void;
    };

    // Exit fullscreen only if currently active
    if (doc.fullscreenElement) {
      if (typeof doc.exitFullscreen === 'function') {
        doc.exitFullscreen().catch((err) => {
          this.snackbar.showError(platformMessages.failedToExitFullScreen, err);
        });
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }

  imageError() {
    this.isImageError = true;
  }

  openConfirmationDialog(
    dialogData: ConfirmationDialogData,
    onConfirm: () => void,
    onCancelClick: () => void,
  ): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      disableClose: true,
      data: dialogData,
      panelClass: 'custom-dialog-radius',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) onConfirm();
      else onCancelClick();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cheatPrevention.stopMonitoring();
  }

  private decodeRouteId(): void {
    this.encodedId = this.route.snapshot.paramMap.get('id');
    const state = history.state;
    if (!this.encodedId) {
      this.snackbar.showError(platformMessages.invalideBattleId);
      this.router.navigate([Navigations.User, Navigations.Battles, Navigations.BattleList]);
      return;
    }
    if (state?.battleStartDetails) {
      this.battleStartDetails = state.battleStartDetails;
      this.opponent = state.battleStartDetails.opponentProfile;
      this.battleAttemptId = this.battleStartDetails!.battleAttemptId;
      const expiry = Date.now() + 10 * 60 * 1000;
      localStorage.setItem(
        this.BATTLE_ATTEMPT_ID,
        JSON.stringify({ attemptedId: this.battleAttemptId, expiry }),
      );
    }

    try {
      const urlDecoded = decodeURIComponent(this.encodedId);
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

  // Handler implementation
  private readonly beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    this.reloadAttempted = true;
    return event;
  };

  private showResumeDialog(): void {
    this.openConfirmationDialog(
      resumeBattleDialog,
      () => this.resumeBattle(),
      () => this.completeBattle('User chose not to resume the battle'),
    );
  }

  private readonly pageShowHandler = () => {
    this.showResumeDialog();
  };

  private async reconnectToHub(): Promise<void> {
    try {
      await this.battleHub.connect().then(() => {
        const battleAttemptData = localStorage.getItem(this.BATTLE_ATTEMPT_ID);
        const parsedData = battleAttemptData ? JSON.parse(battleAttemptData) : null;
        this.battleAttemptId = parsedData.attemptedId;
        this.battleHub.resumeBattle(this.battleAttemptId!);
      });

      // React to matchmaking events
      this.battleHub.onBattleResumed
        .pipe(takeUntil(this.destroy$))
        .subscribe((result: BattleStartDetails) => {
          if (result !== null) {
            this.battleStartDetails = result;
            this.battleAttemptId = result.battleAttemptId;
            const expiry = Date.now() + 10 * 60 * 1000;
            localStorage.setItem(
              this.BATTLE_ATTEMPT_ID,
              JSON.stringify({ attemptedId: this.battleAttemptId, expiry }),
            );
            this.snackbar.showSuccess(platformMessages.battleResumed);
            this.redirectToBattle();
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
}
