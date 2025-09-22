import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.dev';
import * as signalR from '@microsoft/signalr';
import { platformMessages } from '../../../utils/constants';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { PlayerProfileDTO } from '../../../pages/user/user-battles/interface/search-opponent.interface';
import { Subject } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BattleHubService {
  private hubConnection: signalR.HubConnection | null = null;
  private readonly snackbar = inject(SnackbarService);
  private readonly authService = inject(AuthService);

  // Only need these two events for matchmaking
  private readonly searching$ = new Subject<void>();
  private readonly matchFound$ = new Subject<PlayerProfileDTO>();

  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  /** Subscribe to Searching event */
  get onSearching() {
    return this.searching$.asObservable();
  }

  /** Subscribe to MatchFound event */
  get onMatchFound() {
    return this.matchFound$.asObservable();
  }

  /** Check if connection is established */
  get connected(): boolean {
    return this.isConnected && this.hubConnection?.state === signalR.HubConnectionState.Connected;
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

  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    // Only these two events are needed for matchmaking
    this.hubConnection.on(platformMessages.battleHubSearching, () => {
      this.searching$.next();
    });

    this.hubConnection.on(platformMessages.battleHubMatchFound, (result: PlayerProfileDTO) => {
      this.matchFound$.next(result);
      if (result !== null) {
        this.snackbar.showSuccess(`${platformMessages.matchedWith} ${result.userName}!`);
      }
    });

    // Optional: Keep connection status handlers if you want feedback
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
        this.snackbar.showError(
          error instanceof Error && error.message
            ? error.message
            : platformMessages.connectionClosedError,
        );
      }
    });
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
}
