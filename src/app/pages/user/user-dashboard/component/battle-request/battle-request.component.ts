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
import { BattleRequestStatus } from '../../../../../shared/enums/user-dashboard.enum';
import {
  globalGetInitials,
  globalGetInitialsColorClass,
} from '../../../../../utils/get-profile-initials.utils';
import { IncomingBattleRequest } from '../../../../../shared/interfaces/incoming-battle-request.interface';
import { BattleHubService } from '../../../../../services/user/user-battles/battle-hub.service';

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

  acceptRequest(request: BattleRequestWithProfile) {
    this.dashboardService
      .updateBattleRequestStatus({
        requestId: request.requestId,
        status: BattleRequestStatus.acceptRequest,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.data) {
            this.snackBarService.showSuccess(
              platformMessages.successTitle,
              battleRequestMessages.accepted(request.senderUserName),
            );
            this.loadBattleRequests();
          }
        },
        error: () => {
          this.snackBarService.showError(
            platformMessages.errorTitle,
            battleRequestMessages.acceptFailed(request.senderUserName),
          );
        },
      });
  }

  declineRequest(request: BattleRequestWithProfile) {
    this.dashboardService
      .updateBattleRequestStatus({
        requestId: request.requestId,
        status: BattleRequestStatus.declineRequest,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.data) {
            this.snackBarService.showSuccess(
              platformMessages.successTitle,
              battleRequestMessages.declined(request.senderUserName),
            );
            this.loadBattleRequests();
          }
        },
        error: () => {
          this.snackBarService.showError(
            platformMessages.errorTitle,
            battleRequestMessages.declineFailed(request.senderUserName),
          );
        },
      });
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
}
