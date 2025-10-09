import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleQuestionComponent } from './battle-question/battle-question.component';
import {
  BattleQuestion,
  BattleStartDetails,
  LastAnswerdQuestionDetail,
  ScoreChangedDto,
} from './interfaces/battle-attempt.interface';
import { MatIconModule } from '@angular/material/icon';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { battleTag, resumeBattleDialog } from './configs/battle-attempt.config';
import { TagComponent } from '../../../shared/components/tag/tag.component';
import {
  BattlePlayerHelper,
  BattlePlayerInfo,
  closeFullscreen,
  getInitials,
  getPlayer2TagConfig,
  getSavedBattleId,
  mapBackendQuestionType,
  openFullscreen,
  saveBattleId,
} from './battle-atttempt.helper';
import { autoSubmitBattleMessage, platformMessages } from '../../../utils/constants';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Navigations } from '../../../shared/enums/navigation';
import { BattleHubService } from '../../../services/user/user-battles/battle-hub.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { TagInputConfig } from '../../../shared/interfaces/tag-component.interface';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CheatPreventionService } from '../../../shared/service/cheat-prevention/cheat-prevention.service';
import { DisableQuizShortcutsDirective } from '../../../shared/Directives/disable-quiz-shortcuts.directive';
import { globalGetInitialsColorClass } from '../../../utils/get-profile-initials.utils';

@Component({
  selector: 'app-battle-attempt-layout',
  standalone: true,
  imports: [
    CommonModule,
    BattleQuestionComponent,
    MatIconModule,
    ProgressBarComponent,
    TagComponent,
    DisableQuizShortcutsDirective,
  ],
  templateUrl: './battle-attempt-layout.component.html',
  styleUrls: ['./battle-attempt-layout.component.scss'],
})
export class BattleAttemptLayoutComponent implements OnInit, OnDestroy {
  currentQuestionIndex: number = 1;
  questionTimerId?: number;
  questionDelayId?: number;
  decodedId!: number;
  attemptedId!: number;
  battleId: number;
  totalQuestion: number = 0;
  currentUserId: number;
  isUserAnswerCorrect: boolean = false;
  myAccuracy: number = 0;
  userAnswer: string = '';
  showCorrectAnswer = false;
  currentUserExitedFullScreen = false;
  remainingSeconds = 0;
  currentQuestionArrayIndex = 0;

  battleTag = battleTag;
  selectedAnswer: string = '';
  correctAnswer: string = '';

  battleStatus: 'leading' | 'behind' | 'tied' = 'tied';
  mySide!: 'player1' | 'player2';
  opponentStatus: 'thinking' | 'answered' = 'thinking';

  me: { id: number; name: string; imageUrl: string; score: number } = {
    id: 0,
    name: 'You',
    imageUrl: '',
    score: 0,
  };

  opponent: { id: number; name: string; imageUrl: string; score: number } = {
    id: 0,
    name: 'Opponent',
    imageUrl: '',
    score: 0,
  };
  isImageError: Record<string, boolean> = { me: false, opponent: false };

  opponentTag: TagInputConfig = getPlayer2TagConfig(this.opponentStatus);
  questions: BattleQuestion[] = [];

  getInitials = getInitials;

  private readonly destroy$ = new Subject<void>();
  private readonly battleHubService = inject(BattleHubService);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly cheatPrevention = inject(CheatPreventionService);

  ngOnInit(): void {
    this.cheatPrevention.startMonitoring();
    this.cheatPrevention.violations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((reason) => this.handleViolation(reason));

    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    window.addEventListener('pageshow', this.pageShowHandler);
    this.decodeRouteId();
    this.connectHub();

    const battleStartType = sessionStorage.getItem('battle_start_type');

    if (battleStartType === 'reload') {
      this.attemptedId = getSavedBattleId() ?? this.attemptedId;
      this.battleHubService.resumeBattle(this.attemptedId);
      sessionStorage.removeItem('battle_start_type');
    }
  }

  //#region decode Id
  decodeRouteId(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (!encodedId) return;

    try {
      const urlDecoded = decodeURIComponent(encodedId);
      const base64Decoded = atob(urlDecoded);
      const asNumber = Number(base64Decoded);

      if (!isNaN(asNumber)) {
        this.decodedId = asNumber;
        const storedBattleId = getSavedBattleId();
        const hubBattleId = this.battleHubService.getCurrentBattleAttemptId();
        const battleId = storedBattleId ?? hubBattleId;

        if (!battleId) {
          this.snackbar.showError(platformMessages.errorTitle, platformMessages.invalidBattleId);
          return;
        }
      } else {
        this.snackbar.showError(platformMessages.invalidBattleId);
        this.decodedId = 0;
      }
    } catch {
      this.snackbar.showError(platformMessages.invalidBattleId);
      this.decodedId = 0;
    }
  }
  //#endregion

  //#region complete battle
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

      this.clearQuestionTimer();
      this.redirectToBattleResult();
    }
  }
  //#endregion

  //#region submit ans
  submitAnswer(answer: string): void {
    if (!this.battleHubService.connected) {
      this.connectHub();
    }

    this.selectedAnswer = answer;
    this.clearQuestionTimer();

    this.battleHubService.submitAnswer(this.attemptedId!, this.currentQuestionIndex, answer);

    if (this.currentQuestionIndex === this.totalQuestion) {
      this.redirectToBattleResult();
    }
  }
  //#endregion

  //#region Timer
  startQuestionTimer(seconds: number): void {
    this.clearQuestionTimer();
    this.remainingSeconds = seconds;
    this.questionTimerId = window.setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        window.clearInterval(this.questionTimerId);
        this.handleLocalTimeout();
      }
    }, 1000);
  }

  clearQuestionTimer(): void {
    if (this.questionTimerId) {
      clearInterval(this.questionTimerId);
      this.questionTimerId = undefined;
    }
    if (this.questionDelayId) {
      clearTimeout(this.questionDelayId);
      this.questionDelayId = undefined;
    }
  }

  //#endregion

  //#region Resume battle
  resumeBattle(): void {
    this.connectHub();
    this.attemptedId = getSavedBattleId() ?? this.attemptedId;

    if (this.attemptedId) {
      openFullscreen();
    } else {
      this.snackbar.showError(platformMessages.errorTitle, platformMessages.resumeBattleFailed);
    }
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
  //#endregion

  get progressBarPercentage(): number {
    if (!this.totalQuestion) return 0;
    return Math.round((this.currentQuestionIndex / this.totalQuestion) * 100);
  }

  get formattedQuestionTime(): string {
    if (!this.questions.length || this.remainingSeconds <= 0) return '0:00';
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cheatPrevention.stopMonitoring();
    this.clearQuestionTimer();
    this.battleHubService.cleanupBattleSubjects();
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    window.removeEventListener('pageshow', this.pageShowHandler);
  }

  private async handleLocalTimeout(): Promise<void> {
    if (!this.questions.length) return;

    if (this.currentQuestionIndex === this.totalQuestion) {
      this.snackbar.showInfo(platformMessages.timeUp);
      this.redirectToBattleResult();
    } else {
      this.snackbar.showInfo(platformMessages.timeoutNextQuestion);
    }
  }

  private redirectToBattleResult(): void {
    const state = history.state;
    setTimeout(() => {
      this.battleHubService.cleanupBattleSubjects();
      this.snackbar.showInfo(platformMessages.battleComplted);
      this.router.navigate([
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
        Navigations.WaitingBattleResult,
        state.battleId,
      ]); // put result route here
      if (document.fullscreenElement) {
        closeFullscreen();
      }
    }, 3000);
  }

  private readonly beforeUnloadHandler = (): void => {
    saveBattleId(this.attemptedId);
  };

  private async connectHub(): Promise<void> {
    if (!this.battleHubService.connected) {
      await this.battleHubService.connect();
    }
    this.subscribeHubEvents();
  }

  private readonly pageShowHandler = () => {
    this.showResumeDialog();
    const savedAttemptId = getSavedBattleId();
    if (!savedAttemptId) return;

    try {
      if (this.battleHubService.connected) {
        this.battleHubService.resumeBattle(savedAttemptId);
      } else {
        this.battleHubService.connect().then(() => {
          this.battleHubService.resumeBattle(savedAttemptId!);
        });
      }
      this.snackbar.showInfo(platformMessages.battleResumeSuccess);
    } catch {
      this.snackbar.showError(platformMessages.resumeBattleFailed);
    }
  };

  private handleViolation(reason: string): void {
    if (this.attemptedId) {
      this.battleHubService.interruptBattle(this.attemptedId);
    }
    this.currentUserExitedFullScreen = true;
    this.completeBattle(reason);
  }

  private showResumeDialog(): void {
    this.openConfirmationDialog(
      resumeBattleDialog,
      () => this.resumeBattle(),
      () => this.handleViolation(platformMessages.resumeBattleFailed),
    );
  }

  private handleBattleStart(details: BattleStartDetails): void {
    this.attemptedId = details.battleAttemptId;
    this.totalQuestion = details.totalQuestions;
    this.battleTag = this.buildBattleTag(details);
    const myId = +(this.authService.getCurrentUserId() ?? 0);
    const info: BattlePlayerInfo = BattlePlayerHelper.resolvePlayers(details, myId);
    this.mySide = info.mySide;

    if (this.mySide === 'player1') {
      this.me = info.player1;
      this.opponent = info.player2;
    } else {
      this.me = info.player2;
      this.opponent = info.player1;
    }

    this.opponentTag = getPlayer2TagConfig(this.opponentStatus);
    saveBattleId(this.attemptedId);
  }

  private buildBattleTag(details: BattleStartDetails): TagInputConfig {
    return {
      id: `battle-${details.battleAttemptId || 'tag'}`,
      label: details.battleName || 'Battle',
      type: 'static',
      isSelected: false,
      hasBorder: true,
      backgroundColor: 'lightPurple',
      textColor: 'purple',
    };
  }

  //#region HubEvents
  private subscribeHubEvents(): void {
    const currentBattleId = getSavedBattleId();

    if (currentBattleId) {
      this.attemptedId = currentBattleId;
    }

    // Battle started
    this.battleHubService.onBattleStarted
      .pipe(takeUntil(this.destroy$))
      .subscribe((details: BattleStartDetails) => {
        this.handleBattleStart(details);
        this.snackbar.showInfo(platformMessages.battleStart);
      });

    // Battle resumed
    this.battleHubService.onBattleResumed
      .pipe(takeUntil(this.destroy$))
      .subscribe((details: BattleStartDetails) => {
        this.handleBattleStart(details);
        this.snackbar.showSuccess('Battle resumed successfully!');
      });

    // Questions
    this.battleHubService.onQuestion.pipe(takeUntil(this.destroy$)).subscribe({
      next: (rawQuestion: BattleQuestion) => {
        const question: BattleQuestion = {
          questionIndex: rawQuestion.questionIndex,
          quizQuestionId: rawQuestion.quizQuestionId,
          questionName: rawQuestion.questionName,
          questionType: mapBackendQuestionType(rawQuestion.questionType),
          options: rawQuestion.options ?? [],
          timeInSeconds: rawQuestion.timeInSeconds ?? 60,
        };

        this.questions.push(question);
        this.currentQuestionIndex = question.questionIndex;
        this.currentQuestionArrayIndex = this.questions.length - 1;
        this.selectedAnswer = '';
        this.showCorrectAnswer = false;
        this.userAnswer = '';
        this.correctAnswer = '';

        this.startQuestionTimer(question.timeInSeconds);
      },
      error: () => {
        this.snackbar.showError(platformMessages.questionLoadFail);
      },
    });

    // Score updates
    this.battleHubService.onScoreUpdate
      .pipe(takeUntil(this.destroy$))
      .subscribe((scores: ScoreChangedDto) => {
        let opponentCurrentIndex: number;
        let myCurrentIndex: number;

        if (this.mySide === 'player1') {
          this.me.score = scores.player1Score;
          this.opponent.score = scores.player2Score;
          opponentCurrentIndex = scores.player2CurrentIndex;
          myCurrentIndex = scores.player1CurrentIndex;
          this.myAccuracy = scores.player1CorrectedAns;
        } else {
          this.me.score = scores.player2Score;
          this.opponent.score = scores.player1Score;
          opponentCurrentIndex = scores.player1CurrentIndex;
          myCurrentIndex = scores.player2CurrentIndex;
          this.myAccuracy = scores.player2CorrectedAns;
        }

        if (myCurrentIndex > opponentCurrentIndex) {
          this.battleStatus = 'leading';
        } else if (myCurrentIndex < opponentCurrentIndex) {
          this.battleStatus = 'behind';
        } else {
          this.battleStatus = 'tied';
        }

        const previousOpponentStatus = this.opponentStatus;
        this.opponentStatus = opponentCurrentIndex > myCurrentIndex ? 'answered' : 'thinking';

        if (previousOpponentStatus !== this.opponentStatus) {
          this.opponentTag = getPlayer2TagConfig(this.opponentStatus);
        }
      });

    // Last answered question details
    this.battleHubService.lastAnsweredDetail
      .pipe(takeUntil(this.destroy$))
      .subscribe((detail: LastAnswerdQuestionDetail) => {
        this.correctAnswer = detail.correctAnswer;
        this.isUserAnswerCorrect = detail.isCorrect;
        this.userAnswer = this.selectedAnswer;
        this.showCorrectAnswer = true;

        setTimeout(() => {
          this.showCorrectAnswer = false;
          this.correctAnswer = '';
          this.userAnswer = '';
        }, 3000);
      });

    // opponent interrupted
    this.battleHubService.onPlayerInterrupted
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ userId }) => {
        const myId = +(this.authService.getCurrentUserId() ?? 0);
        if (userId !== myId) {
          this.snackbar.showInfo(platformMessages.opponentLeft);
        }
      });

    // battle ended for particular player
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
  //#endregion

  getInitialsColorClass(name: string): string {
    return globalGetInitialsColorClass(name);
  }

  imageError(player: string): void {
    this.isImageError[player] = true;
  }
}
