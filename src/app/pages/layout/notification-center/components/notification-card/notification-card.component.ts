import { Component, computed, inject, OnDestroy } from '@angular/core';
import {
  deleteButtonConfig,
  getNotificationRoute,
  markAsReadButtonConfig,
  viewDetailsButtonConfig,
} from '../../../configs/navbar.component.config';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { TextButtonComponent } from '../../../../../shared/components/text-button/text-button.component';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { CommonModule } from '@angular/common';
import { NotificationCenterComponent } from '../../notification-center.component';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-notification-card',
  imports: [
    OutlineButtonComponent,
    TextButtonComponent,
    TagComponent,
    CommonModule,
    MatTooltipModule,
  ],
  templateUrl: './notification-card.component.html',
  styleUrl: './notification-card.component.scss',
})
export class NotificationCardComponent implements OnDestroy {
  markAsReadButton = markAsReadButtonConfig;
  deleteButton = deleteButtonConfig;
  viewDetailsButton = viewDetailsButtonConfig;

  notifications = computed(() => this.parent?.notifications() ?? []);

  //NOTE: Uncomment and use after backend API is implemented to fetch and display notifications
  // private readonly service = inject(NotificationCenterService);
  // private readonly snackbarService = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly parent = inject(NotificationCenterComponent, { optional: true });
  private readonly destroy$ = new Subject<void>();

  //NOTE: Uncomment and use after backend API is implemented to fetch and display notifications
  markAsRead(id: string) {
    // this.service.markAsRead(id).pipe(takeUntil(this.destroy$)).subscribe({
    //   next: (res) => {
    //     if (res.result) {
    //       this.snackbarService.showError(
    //         platformMessages.successTitle,
    //         res.message
    //       );
    //       this.parent?.fetchNotifications();
    //     }
    //     this.snackbarService.showError(
    //       platformMessages.errorTitle,
    //       res.message || platformMessages.errorMessage,
    //     );
    //   },
    //   error: (err) => {
    //     this.snackbarService.showError(
    //       platformMessages.errorTitle,
    //       err?.error?.message || platformMessages.errorMessage,
    //     );
    //   },
    // });
  }

  //NOTE: Uncomment and use after backend API is implemented to fetch and display notifications
  deleteNotification(id: string) {
    // this.service.deleteNotification(id).pipe(takeUntil(this.destroy$)).subscribe({
    //   next: (res) => {
    //     if (res.result) {
    //       this.parent?.fetchNotifications();
    //       this.snackbarService.showSuccess(
    //         platformMessages.successTitle,
    //         res.message
    //       )
    //     }
    //     this.snackbarService.showError(
    //       platformMessages.errorTitle,
    //       res.message || platformMessages.errorMessage,
    //     );
    //   },
    //   error: (err) => {
    //     this.snackbarService.showError(
    //       platformMessages.errorTitle,
    //       err?.error?.message || platformMessages.errorMessage,
    //     );
    //   },
    // });
  }

  viewDetails(category: number) {
    if (!this.parent) return;

    const { path, queryParams } = getNotificationRoute(this.parent.isAdmin, category);
    this.router.navigate([path], { queryParams });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
