import { Component, inject, Input, OnInit } from '@angular/core';
import { BattleRequest, BattleRequestWithProfile } from '../../interfaces/battle-request.interface';
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

@Component({
  selector: 'app-battle-requests',
  imports: [MatIconModule, CommonModule, FilledButtonComponent, OutlineButtonComponent],
  templateUrl: './battle-request.component.html',
  styleUrl: './battle-request.component.scss',
})
export class BattleRequestComponent implements OnInit {
  requests: BattleRequestWithProfile[] = [];
  acceptButton = acceptButtonConfig;
  declineButton = declineButtonConfig;
  dashboardService = inject(UserDashboardService);
  private readonly snackBarService = inject(SnackbarService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadBattleRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBattleRequests(): void {
    this.dashboardService
      .getBattleRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<BattleRequest[]>) => {
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
            err.message || platformMessages.errorMessage,
          );
        },
      });
  }

  acceptRequest(request: BattleRequestWithProfile) {
    this.dashboardService
      .updateBattleRequestStatus({
        requestId: request.requestId,
        status: 1,
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
        status: 2,
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

  handleImageError(event: Event, request: any) {
    (event.target as HTMLImageElement).style.display = 'none';
    request.displayImage = null;
  }

  private getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(' ');
    return words.length === 1
      ? words[0].charAt(0).toUpperCase()
      : words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  }

  private getInitialsColorClass(name: string): string {
    if (!name) return 'bg-avatar-0';
    const colorsCount = 12;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorsCount;
    return `bg-avatar-${index}`;
  }
}
