import { Component, inject, OnInit } from '@angular/core';
import { BattleRequestWithProfile } from '../../interfaces/battle-request.interface';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { acceptButtonConfig, declineButtonConfig } from '../../configs/dashboard-buttons.config';
import { UserDashboardService } from '../../../../../services/user/user-dashboard/user-dashboard.service';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../../../environments/environment.dev';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { battleRequestMessages, platformMessages } from '../../../../../utils/constants';
import { Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  globalGetInitials,
  globalGetInitialsColorClass,
} from '../../../../../utils/get-profile-initials.utils';
import { IncomingBattleRequest } from '../../../../../shared/interfaces/incoming-battle-request.interface';
import { BattleHubService } from '../../../../../services/user/user-battles/battle-hub.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-battle-request',
  imports: [
    MatIconModule,
    CommonModule,
    FilledButtonComponent,
    OutlineButtonComponent,
    MatTooltipModule,
  ],
  templateUrl: './battle-request.component.html',
  styleUrl: './battle-request.component.scss',
})
export class BattleRequestComponent implements OnInit {
  requests: BattleRequestWithProfile[] = [];
  acceptButton = acceptButtonConfig;
  declineButton = declineButtonConfig;
  private readonly dashboardService = inject(UserDashboardService);
  private readonly snackBarService = inject(SnackbarService);
  private readonly destroy$ = new Subject<void>();
  private readonly battleHubService = inject(BattleHubService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadBattleRequests();
    this.subscribeToBattleHub();
  }

  loadBattleRequests(): void {
    this.dashboardService
      .getBattleRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<IncomingBattleRequest[]>) => {
          if (res.result && res.data) {
            this.requests = res.data.map((req) => ({
              ...req,
              displayImage: req.senderProfilePic
                ? `${environment.imageBaseUrl}/${req.senderProfilePic}`
                : null,
              initials: this.getInitials(req.senderFullName),
              initialsColor: this.getInitialsColorClass(req.senderFullName),
            }));
          }
        },
        error: (err) => {
          this.snackBarService.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  subscribeToBattleHub(): void {
    this.battleHubService
      .ensureConnection()
      .then(() => {
        this.battleHubService.onBattleRequest
          .pipe(takeUntil(this.destroy$))
          .subscribe((requests: IncomingBattleRequest[]) => {
            requests.forEach((request) => {
              const requestWithProfile = {
                ...request,
                displayImage: request.senderProfilePic ?? '',
                initials: this.getInitials(request.senderFullName),
                initialsColor: this.getInitialsColorClass(request.senderFullName),
              };
              this.requests.unshift(requestWithProfile);
            });
          });
      })
      .catch(() => {
        this.snackBarService.showError('Failed to connect to battle notifications.');
      });
  }

  acceptRequest(request: BattleRequestWithProfile): void {
    this.battleHubService.acceptRequest(request);

    this.requests = this.requests.filter((r) => r.requestId !== request.requestId);

    this.snackBarService.showSuccess(
      platformMessages.successTitle,
      battleRequestMessages.accepted(request.senderUserName),
    );

    this.navigateToSearchOpponent(request);
  }

  declineRequest(request: BattleRequestWithProfile): void {
    this.battleHubService.declineRequest(request.requestId);

    this.requests = this.requests.filter((r) => r.requestId !== request.requestId);

    this.snackBarService.showSuccess(
      platformMessages.successTitle,
      battleRequestMessages.declined(request.senderUserName),
    );
  }

  handleImageError(event: Event, request: BattleRequestWithProfile) {
    (event.target as HTMLImageElement).style.display = 'none';
    request.displayImage = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.battleHubService.cleanupIncomingRequests();
  }

  private getInitials(name: string): string {
    return globalGetInitials(name);
  }

  private getInitialsColorClass(name: string): string {
    return globalGetInitialsColorClass(name);
  }

  private navigateToSearchOpponent(request: BattleRequestWithProfile): void {
    if (!request?.battleId || request.battleId <= 0) return;

    const battleData = {
      battleName: request.battleName,
      battleCategory: request.battleCategory,
      battleXp: 0,
      battleDifficulty: request.battleDifficulty,
    };

    this.router.navigate(
      [
        'user',
        'battles',
        'battle-list',
        'waiting-opponent',
        btoa(encodeURIComponent(request.battleId)),
      ],
      {
        state: { battleData },
      },
    );
  }
}
