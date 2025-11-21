import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { IncomingBattleRequest } from '../../../shared/interfaces/incoming-battle-request.interface';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { IncomingRequestNotificationComponent } from '../../../shared/components/incoming-request-notification/incoming-request-notification.component';
import { BattleHubService } from '../../../services/user/user-battles/battle-hub.service';
import { notificationTimeout } from '../../../utils/constants';
import { Router } from '@angular/router';
import { Navigations } from '../../../shared/enums/navigation';

@Component({
  selector: 'app-battle-request-notifications',
  standalone: true,
  imports: [IncomingRequestNotificationComponent, CommonModule],
  templateUrl: './battle-request-notifications.component.html',
  styleUrls: ['./battle-request-notifications.component.scss'],
})
export class BattleRequestNotificationsComponent implements OnInit, OnDestroy {
  notifications: IncomingBattleRequest[] = [];
  private readonly battleHubService = inject(BattleHubService);
  private readonly destroy$ = new Subject<void>();
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.connectToHub();
  }

  connectToHub() {
    this.battleHubService.connect();

    this.battleHubService.onBattleRequest.pipe(takeUntil(this.destroy$)).subscribe((requests) => {
      if (!requests) return;
      const incomingRequests = Array.isArray(requests) ? requests : [requests];
      incomingRequests.forEach((req) => this.addNotification(req));
    });
  }

  addNotification(request: IncomingBattleRequest) {
    const exists = this.notifications.some((n) => n.requestId === request.requestId);
    if (!exists) {
      this.notifications.unshift(request);
      setTimeout(() => this.removeNotification(request), notificationTimeout);
    }
  }

  removeNotification(request: IncomingBattleRequest) {
    this.notifications = this.notifications.filter((n) => n.requestId !== request.requestId);
    this.battleHubService.removeIncomingRequest(request.requestId);
  }

  acceptRequest(request: IncomingBattleRequest): void {
    this.battleHubService.acceptRequest(request);
    this.removeNotification(request);

    const encodedBattleId = btoa(encodeURIComponent(request.battleId.toString()));

    this.router.navigate(
      [
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
        Navigations.WaitingOpponent,
        encodedBattleId,
      ],
      {
        state: { battleData: request },
      },
    );
  }

  declineRequest(request: IncomingBattleRequest) {
    this.battleHubService.declineRequest(request.requestId);
    this.removeNotification(request);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.battleHubService.cleanupIncomingRequests();
  }
}
