import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import {
  autoSubmitBattleMessage,
  battleInstructionsShowTime,
  platformMessages,
} from '../../../../utils/constants';
import { Navigations } from '../../../../shared/enums/navigation';
import { TagComponent } from '../../../../shared/components/tag/tag.component';
import { resumeBattleDialog, skipButtonConfig } from '../configs/battle-attempt.config';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';
import { BattleHubService } from '../../../../services/user/user-battles/battle-hub.service';
import { UserBattlesService } from '../../../../services/user/user-battles/user-battles.service';
import { CheatPreventionService } from '../../../../shared/service/cheat-prevention/cheat-prevention.service';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';
import { getSavedBattleId, openFullscreen, saveBattleId } from '../battle-atttempt.helper';
import { BattleInstruction, BattleStartDetails } from '../interfaces/battle-attempt.interface';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { DisableQuizShortcutsDirective } from '../../../../shared/Directives/disable-quiz-shortcuts.directive';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';

@Component({
  selector: 'app-battle-instruction',
  imports: [
    CommonModule,
    TagComponent,
    MatIcon,
    DisableQuizShortcutsDirective,
    FilledButtonComponent,
  ],
  templateUrl: './battle-instruction.component.html',
  styleUrls: ['./battle-instruction.component.scss'],
})
export class BattleInstructionComponent implements OnInit, OnDestroy {
  countdownId?: ReturnType<typeof setInterval>;
  decodedId!: number;
  attemptedId!: number;
  battleInstructions: BattleInstruction;
  currentUserExitedFullScreen = false;
  countdownSeconds = battleInstructionsShowTime;
  skipBtnConfig = skipButtonConfig;

  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly battleHubService = inject(BattleHubService);
  private readonly battleService = inject(UserBattlesService);
  private readonly cheatPrevention = inject(CheatPreventionService);
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.cheatPrevention.startMonitoring();
    this.cheatPrevention.violations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((reason) => this.handleViolation(reason));

    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    window.addEventListener('pageshow', this.pageShowHandler);
    this.decodeRouteId();
    this.connectHub();
  }

  completeBattle(reason: string): void {
    if (this.currentUserExitedFullScreen) {
      this.snackbar.showError(autoSubmitBattleMessage(reason));

      const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void>;
        msExitFullscreen?: () => void;
      };

      if (doc.fullscreenElement) {
        if (typeof doc.exitFullscreen === 'function') {
          doc
            .exitFullscreen()
            .catch((err) => this.snackbar.showError(platformMessages.failedToExitFullScreen, err));
        } else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
        else if (doc.msExitFullscreen) doc.msExitFullscreen();
      }

      this.clearCountdown();
      this.redirectToBattleResult();
    }
  }

  decodeRouteId(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (!encodedId) return;

    try {
      const urlDecoded = decodeURIComponent(encodedId);
      const base64Decoded = atob(urlDecoded);
      const asNumber = Number(base64Decoded);

      if (!isNaN(asNumber)) {
        this.decodedId = asNumber;
        const hubBattleId = this.battleHubService.getCurrentBattleAttemptId();

        if (!hubBattleId) {
          this.snackbar.showError(platformMessages.errorTitle, platformMessages.invalidBattleId);
          return;
        }

        this.getBattleInfo(hubBattleId);
      } else {
        this.snackbar.showError(platformMessages.invalidBattleId);
        this.decodedId = 0;
      }
    } catch {
      this.snackbar.showError(platformMessages.invalidBattleId);
      this.decodedId = 0;
    }
  }

  resumeBattleInstruction(): void {
    this.connectHub();
    this.attemptedId = getSavedBattleId() ?? this.attemptedId;

    if (this.attemptedId) {
      openFullscreen();
      sessionStorage.setItem('battle_start_type', 'reload');
      this.navigateToBattle(this.attemptedId);
    } else {
      this.snackbar.showError(platformMessages.errorTitle, platformMessages.resumeBattleFailed);
    }
  }

  getBattleInfo(battleAttemptId: number): void {
    this.battleService.getBattleInstruction(battleAttemptId).subscribe({
      next: (res) => {
        if (res.result && res.data) {
          this.battleInstructions = res.data;
          this.attemptedId = this.battleInstructions.battleAttemptId;
          saveBattleId(this.attemptedId);
          this.startCountdownTimer();
        } else {
          this.snackbar.showError(platformMessages.errorTitle, platformMessages.errorMessage);
        }
      },
      error: (err) => {
        this.snackbar.showError(
          platformMessages.errorTitle,
          err?.error?.message || platformMessages.errorMessage,
        );
      },
    });
  }

  skipToBattle(): void {
    this.battleHubService.skipInstructions(this.attemptedId);
    this.navigateToBattle(this.attemptedId);
    this.clearCountdown();
  }

  navigateToBattle(attemptId: number) {
    const state = history.state;
    const encodedId = btoa(attemptId.toString());
    this.router.navigate(
      [Navigations.User, Navigations.Battles, Navigations.BattleAttempt, encodedId],
      {
        state: {
          battleId: state.battleId,
        },
      },
    );
  }

  getBattleCategoryTagConfig(): TagInputConfig {
    let label = 'category';
    if (this.battleInstructions) label = `${this.battleInstructions.battleCategory}`;
    return {
      id: label.toLowerCase(),
      label,
      type: 'static',
      isSelected: false,
      hasBorder: true,
      backgroundColor: 'white',
      textColor: 'black',
    };
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
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    window.removeEventListener('pageshow', this.pageShowHandler);
  }

  private handleViolation(reason: string): void {
    if (this.attemptedId) {
      this.battleHubService.interruptBattle(this.attemptedId);
    }
    this.currentUserExitedFullScreen = true;
    this.completeBattle(reason);
  }

  private redirectToBattleResult(): void {
    const state = history.state;
    setTimeout(() => {
      this.snackbar.showInfo(platformMessages.battleComplted);
      this.router.navigate([
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
        Navigations.WaitingBattleResult,
        state.battleId,
      ]); // put result route here
      this.battleHubService.cleanupBattleSubjects();
    }, 3000);
  }

  private startCountdownTimer() {
    this.clearCountdown();
    this.countdownId = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        this.clearCountdown();
        if (this.decodedId) {
          this.snackbar.showInfo(platformMessages.battleStart);
          this.navigateToBattle(this.decodedId);
        }
      }
    }, 1000);
  }

  private clearCountdown() {
    if (this.countdownId) {
      clearInterval(this.countdownId);
      this.countdownId = undefined;
    }
  }

  private async connectHub(): Promise<void> {
    if (!this.battleHubService.connected) {
      await this.battleHubService.connect();
    }
    this.registerHubEvents();
  }

  private registerHubEvents(): void {
    this.battleHubService.onBattleStarted
      .pipe(takeUntil(this.destroy$))
      .subscribe((details: BattleStartDetails) => {
        this.decodedId = details.battleAttemptId;
        this.startCountdownTimer();
      });

    this.battleHubService.onPlayerInterrupted
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ userId }) => {
        const myId = +(this.authService.getCurrentUserId() ?? 0);
        if (userId !== myId) {
          this.snackbar.showInfo(platformMessages.opponentLeft);
        }
      });

    this.battleHubService.onBattleEndedForParticularPlayer
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

  private readonly beforeUnloadHandler = () => {
    saveBattleId(this.attemptedId);
  };

  private showResumeDialog(): void {
    this.openConfirmationDialog(
      resumeBattleDialog,
      () => this.resumeBattleInstruction(),
      () => this.handleViolation(platformMessages.resumeBattleFailed),
    );
  }

  private readonly pageShowHandler = () => {
    this.showResumeDialog();
  };
}
