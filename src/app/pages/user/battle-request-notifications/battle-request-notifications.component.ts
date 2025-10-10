import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { IncomingBattleRequest } from '../../../shared/interfaces/incoming-battle-request.interface';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { IncomingRequestNotificationComponent } from '../../../shared/components/incoming-request-notification/incoming-request-notification.component';
import { BattleHubService } from '../../../services/user/user-battles/battle-hub.service';

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

  ngOnInit(): void {
    // Connect to the SignalR hub
    this.connectToHub();
  }

  connectToHub() {
    this.battleHubService.connect();

    // Subscribe to incoming battle requests
    this.battleHubService.onBattleRequest.pipe(takeUntil(this.destroy$)).subscribe((requests) => {
      if (!requests) return;
      const incomingRequests = Array.isArray(requests) ? requests : [requests];
      incomingRequests.forEach((req) => this.addNotification(req));
    });
  }

  /** Add notification only if it doesn't already exist */
  addNotification(request: IncomingBattleRequest) {
    const exists = this.notifications.some((n) => n.requestId === request.requestId);
    if (!exists) {
      this.notifications.unshift(request); // latest on top
      // Auto-remove after 30s
      setTimeout(() => this.removeNotification(request), 30000);
    }
  }

  /** Remove notification by requestId */
  removeNotification(request: IncomingBattleRequest) {
    this.notifications = this.notifications.filter((n) => n.requestId !== request.requestId);
    // Optional: notify service if you want to update BehaviorSubject
    this.battleHubService.removeIncomingRequest(request.requestId);
  }

  acceptRequest(request: IncomingBattleRequest) {
    this.battleHubService.acceptRequest(request.requestId);
    this.removeNotification(request);
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
