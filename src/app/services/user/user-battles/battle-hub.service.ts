import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.dev';
import * as signalR from '@microsoft/signalr';
import { platformMessages } from '../../../utils/constants';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import {
  BattleStartDetails,
  PlayerProfileDTO,
} from '../../../pages/user/user-battles/interface/search-opponent.interface';
import { ReplaySubject, Subject } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import {
  BattleQuestion,
  LastAnswerdQuestionDetail,
  ScoreChangedDto,
} from '../../../pages/user/battle-attempt-layout/interfaces/battle-attempt.interface';
import { Router } from '@angular/router';
import { Navigations } from '../../../shared/enums/navigation';
import { BattleCompletionResult } from '../../../pages/user/battle-result/interfaces/battle-completion.interface';
import { UserProfileService } from '../user-profile/user-profile.service';
import { UserBattlesService } from './user-battles.service';

@Injectable({
  providedIn: 'root',
})
export class BattleHubService {
  private hubConnection: signalR.HubConnection | null = null;
  private readonly snackbar = inject(SnackbarService);
  private readonly authService = inject(AuthService);
  private readonly userBattlesService = inject(UserBattlesService);
  private readonly router = inject(Router);

  // Matchmaking events
  private readonly searching$ = new Subject<void>();
  private readonly matchFound$ = new Subject<PlayerProfileDTO>();
  private readonly battleEnded$ = new ReplaySubject<BattleCompletionResult>(1);

  // Battle events
  private battleStarted$ = new ReplaySubject<BattleStartDetails>(1);
  private battleResumed$ = new ReplaySubject<BattleStartDetails>(1);
  private continueBattle$ = new Subject<{ battleAttemptId: number; message: string }>();
  private question$ = new ReplaySubject<BattleQuestion>(1);
  private scoreUpdate$ = new Subject<ScoreChangedDto>();
  private playerInterrupted$ = new Subject<{ userId: number }>();
  private battleEndedForParticularPlayer$ = new Subject<{ userId: number }>();
  private lastAnsweredDetail$ = new Subject<LastAnswerdQuestionDetail>();
  private _errorSubject = new Subject<string>();
  private readonly useprofileUpdatedSource = inject(UserProfileService).profileUpdatedSource;

  private battleAttemptId: number | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  // Public observables
  get onSearching() {
    return this.searching$.asObservable();
  }

  get onMatchFound() {
    return this.matchFound$.asObservable();
  }

  get onBattleStarted() {
    return this.battleStarted$.asObservable();
  }

  get onBattleResumed() {
    return this.battleResumed$.asObservable();
  }

  get onQuestion() {
    return this.question$.asObservable();
  }

  get onScoreUpdate() {
    return this.scoreUpdate$.asObservable();
  }

  get onPlayerInterrupted() {
    return this.playerInterrupted$.asObservable();
  }

  get onBattleEndedForParticularPlayer() {
    return this.battleEndedForParticularPlayer$.asObservable();
  }

  get lastAnsweredDetail() {
    return this.lastAnsweredDetail$.asObservable();
  }

  get onError() {
    return this._errorSubject.asObservable();
  }

  get connected(): boolean {
    return this.isConnected && this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  get onBattleEnded() {
    return this.battleEnded$.asObservable();
  }

  /** Establish SignalR connection */
  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}`, {
        accessTokenFactory: () => this.authService.getAccessToken() ?? '',
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          return Math.min(retryContext.elapsedMilliseconds * 2, 10000);
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.registerEventHandlers();

    this.connectionPromise = this.hubConnection
      .start()
      .then(() => {
        this.isConnected = true;
      })
      .catch((error: unknown) => {
        this.isConnected = false;
        this.connectionPromise = null;
        const errorMessage =
          error instanceof Error && error.message
            ? error.message
            : platformMessages.unKnownErrorMessage;
        this.snackbar.showError(`${platformMessages.connectionFailed} ${errorMessage}`);
        throw error;
      });

    return this.connectionPromise;
  }

  async ensureConnection(): Promise<void> {
    if (this.connected) {
      return;
    }
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    return this.connect();
  }

  /** Start matchmaking process */
  startMatchmaking(battleId: number): void {
    if (!this.connected) {
      this.snackbar.showError(platformMessages.serverNotConnected);
      return;
    }

    this.hubConnection
      ?.invoke(platformMessages.battleHubStartMatching, battleId)
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error && error.message
            ? error.message
            : platformMessages.failedtoStartMatching;
        this.snackbar.showError(errorMessage);
      });
  }

  /** Cancel matchmaking process */
  cancelMatchmaking(battleId: number): void {
    if (!this.connected) {
      return;
    }

    this.hubConnection
      ?.invoke(platformMessages.battleHubCancelMatching, battleId)
      .catch((error: unknown) => {
        this.snackbar.showError(
          error instanceof Error && error.message
            ? error.message
            : platformMessages.failedtoCancelMatching,
        );
      });
  }

  /** Resume battle */
  async resumeBattle(attemptId: number): Promise<void> {
    if (!this.connected) {
      throw new Error('Cannot resume battle: connection lost. Please refresh and try again.');
    }

    try {
      return await this.hubConnection!.invoke('ResumeBattle', attemptId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resume battle';
      this._errorSubject.next(errorMessage);
      throw new Error(errorMessage);
    }
  }

  submitAnswer(battleId: number, index: number, answer: string): void {
    if (!this.connected) {
      this._errorSubject.next('Connection lost. Please check your internet and try again.');
      return;
    }

    this.hubConnection!.invoke('SubmitAnswer', battleId, index, answer).catch((error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : platformMessages.answerSubmitFailed;
      this._errorSubject.next(errorMessage);
    });
  }

  /** Interrupt battle */
  interruptBattle(battleAttemptId: number): void {
    if (!this.connected) {
      return;
    }

    this.hubConnection!.invoke('IntruptByPlayer', battleAttemptId).catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to interrupt battle';
      this.snackbar.showError(errorMessage);
    });
  }

  getCurrentBattleAttemptId(): number | null {
    return this.battleAttemptId;
  }

  cleanupBattleSubjects(): void {
    this.battleStarted$.complete();
    this.battleResumed$.complete();
    this.continueBattle$.complete();
    this.question$.complete();
    this.scoreUpdate$.complete();
    this.lastAnsweredDetail$.complete();
    this.playerInterrupted$.complete();
    this.battleEndedForParticularPlayer$.complete();
    this._errorSubject.complete();

    // Create NEW instances for all subjects (not just some)
    this.battleStarted$ = new ReplaySubject<BattleStartDetails>(1);
    this.battleResumed$ = new ReplaySubject<BattleStartDetails>(1);
    this.continueBattle$ = new Subject<{ battleAttemptId: number; message: string }>();
    this.question$ = new ReplaySubject<BattleQuestion>(1);
    this.scoreUpdate$ = new Subject<ScoreChangedDto>();
    this.lastAnsweredDetail$ = new Subject<LastAnswerdQuestionDetail>();
    this.playerInterrupted$ = new Subject<{ userId: number }>();
    this.battleEndedForParticularPlayer$ = new Subject<{ userId: number }>();
    this._errorSubject = new Subject<string>();

    // Reset state
    this.battleAttemptId = null;
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        this.isConnected = false;
        this.connectionPromise = null;
      } catch (error: unknown) {
        this.snackbar.showError(
          error instanceof Error && error.message
            ? error.message
            : platformMessages.errorInConnection,
        );
      }
    }
  }

  // PRIVATE METHODS

  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    // Battle flow events
    this.hubConnection.on(
      platformMessages.battleHubBattleStarted,
      (details: BattleStartDetails) => {
        this.battleAttemptId = details.battleAttemptId;
        this.battleStarted$.next(details);
      },
    );

    this.hubConnection.on(
      platformMessages.battleHubBattleResumed,
      (details: BattleStartDetails) => {
        this.battleAttemptId = details.battleAttemptId;
        this.battleResumed$.next(details);
      },
    );

    this.hubConnection.on(
      platformMessages.battleHubContinueBattle,
      (data: { battleAttemptId: number; message: string }) => {
        this.continueBattle$.next(data);
      },
    );

    // Game events
    this.hubConnection.on(platformMessages.battleHubReceiveQuestion, (question: BattleQuestion) => {
      this.question$.next(question);
    });

    this.hubConnection.on(
      platformMessages.battleHubReceiveScoreUpdate,
      (score: ScoreChangedDto) => {
        this.scoreUpdate$.next(score);
      },
    );

    this.hubConnection.on(
      platformMessages.battleHubLastAnsweredDetail,
      (detail: LastAnswerdQuestionDetail) => {
        this.lastAnsweredDetail$.next(detail);
      },
    );

    // Player events
    this.hubConnection.on(
      platformMessages.battleHubPlayerInterrupted,
      (data: { userId: number }) => {
        this.playerInterrupted$.next(data);
      },
    );

    this.hubConnection.on(
      platformMessages.battleHubBattleEndedForPlayer,
      (data: { userId: number }) => {
        this.battleEndedForParticularPlayer$.next(data);
      },
    );

    // Matchmaking events
    this.hubConnection.on(platformMessages.battleHubSearching, () => {
      this.searching$.next();
    });

    this.hubConnection.on(platformMessages.battleHubMatchFound, (result: PlayerProfileDTO) => {
      this.matchFound$.next(result);
      if (result !== null) {
        this.snackbar.showSuccess(`${platformMessages.matchedWith} ${result.userName}!`);
      }
    });

    this.hubConnection.on(platformMessages.battleEnded, (result: BattleCompletionResult) => {
      this.battleEnded$.next(result);
      if (result) {
        this.snackbar.showSuccess(platformMessages.successTitle, 'Battle ended!');
        this.userBattlesService.updateBattleResults$.next(true);
        this.stopConnection();
      }
    });

    // Error handling
    this.hubConnection.on(platformMessages.battleError, (message: string) => {
      const errorMsg = message || 'An unexpected error occurred.';
      this._errorSubject.next(errorMsg);
      this.snackbar.showError(errorMsg);
      this.router.navigate([Navigations.Battles, Navigations.BattleList]);
    });

    // Connection events
    this.hubConnection.onreconnecting((error) => {
      this.snackbar.showInfo(
        error instanceof Error && error.message ? error.message : platformMessages.connectionLost,
      );
    });

    this.hubConnection.onreconnected(() => {
      this.snackbar.showSuccess(platformMessages.connectionRestore);
    });

    this.hubConnection.onclose((error) => {
      this.isConnected = false;
      this.connectionPromise = null;

      if (error) {
        const errorMessage =
          error instanceof Error ? error.message : platformMessages.connectionClosedError;
        this.snackbar.showError(errorMessage);
      }
    });
  }
}
