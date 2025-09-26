import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import {
  buildNotificationTabs,
  notificationHeaderConfig,
  searchInputConfig,
  timeFilters,
} from '../configs/notification-center.component.config';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FormControl } from '@angular/forms';
import { TabComponent } from '../../../shared/components/tab/tab.component';
import { markAsAllReadButtonConfig } from '../configs/navbar.component.config';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import {
  clearFilterButtonConfig,
  showFilterButtonConfig,
} from '../../user/browse-quizzes/configs/browse-quizzes.config';
import {
  AdminNotificationCategory,
  NotifcationTabName,
  UserNotificationCategory,
} from '../../../shared/enums/notification-center.enum';
import { MatFormField, MatSelectModule } from '@angular/material/select';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { enumToCategoryList, typeList } from './notification-center.comonent.mapper';
import { AuthService } from '../../../core/auth/services/auth.service';
import { debounceTimeValue, roles } from '../../../utils/constants';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Notifications } from '../interfaces/navbar.component.interface';

@Component({
  selector: 'app-notification-center',
  imports: [
    PageHeaderComponent,
    SearchInputComponent,
    TabComponent,
    OutlineButtonComponent,
    MatSelectModule,
    MatFormField,
    FilledButtonComponent,
  ],
  templateUrl: './notification-center.component.html',
  styleUrls: [
    './notification-center.component.scss',
    '../../user/browse-quizzes/browse-quizzes.component.scss',
  ],
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notificationConfig = notificationHeaderConfig;
  searchInputConfig = searchInputConfig;
  markAsAllReadButton = markAsAllReadButtonConfig;
  showFilterBtn = showFilterButtonConfig;
  clearFilterBtn = clearFilterButtonConfig;

  // State
  selectedTab = 0;
  selectedAdminCategory: number;
  selectedUserCategory: number;
  selectedType: number;
  selectedTime: number;
  notifications = signal<Notifications[]>([]);
  searchControl = new FormControl<string | null>(null);
  isAdmin = false;

  // Filters
  typeList = typeList();
  adminCategoryList = enumToCategoryList(AdminNotificationCategory);
  userCategoryList = enumToCategoryList(UserNotificationCategory);
  timeFilters = timeFilters;

  // Counts per tab
  tabCounts = signal<Record<NotifcationTabName, number>>({
    [NotifcationTabName.All]: 0,
    [NotifcationTabName.Unread]: 0,
    [NotifcationTabName.Read]: 0,
    [NotifcationTabName.Urgent]: 0,
  });

  //NOTE: Uncomment and use after backend API is implemented to fetch and display notifications
  // private readonly service = inject(NotificationCenterService);
  // private readonly snackbarService = inject(SnackbarService);
  private readonly authService = inject(AuthService);
  private readonly searchSubject$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  // Tabs builder
  get tabs() {
    return buildNotificationTabs(this.tabCounts());
  }

  ngOnInit(): void {
    const token = this.authService.getAccessToken();
    if (token) {
      const role = this.authService.getRoleFromToken(token);
      if (role === roles.admin) {
        this.isAdmin = true;
      }
    }

    // search listener
    this.searchSubject$
      .pipe(debounceTime(debounceTimeValue), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.fetchNotifications();
      });

    this.fetchNotifications();
  }

  onSearchInputChange(value: string): void {
    this.searchSubject$.next(value);
  }

  onTabChanged(index: number) {
    this.selectedTab = index;
    this.fetchNotifications();
  }

  onFilterChange() {
    this.fetchNotifications();
  }

  clearFilters() {
    this.searchControl.setValue(null);
    this.selectedAdminCategory = 0;
    this.selectedTime = 0;
    this.selectedType = 0;
    this.selectedUserCategory = 0;

    this.fetchNotifications();
  }

  //NOTE: Uncomment and use after backend API is implemented to fetch and display notifications
  markAsAllRead() {
    // this.service
    //   .markAllAsRead()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (res) => {
    //       if (res.result) {
    //         this.snackbarService.showSuccess(
    //           platformMessages.successTitle,
    //           res.message
    //         );
    //         this.fetchNotifications();
    //       }
    //       this.snackbarService.showError(
    //         platformMessages.errorTitle,
    //         res.message || platformMessages.errorMessage,
    //       );
    //     },
    //     error: (err) => {
    //       this.snackbarService.showError(
    //         platformMessages.errorTitle,
    //         err?.error?.message || platformMessages.errorMessage,
    //       );
    //     },
    //   });
  }

  //NOTE: Uncomment and use after backend API is implemented to fetch and display notifications
  fetchNotifications(): void {
    // const enumValues = Object.values(NotifcationTabName).filter(v => typeof v === 'number') as number[];
    // const selectedEnum = enumValues[this.selectedTab];
    // const payload: NotificationCenterRequest = {
    //   searchText: this.searchControl.value ?? '',
    //   adminCategory: this.isAdmin ? this.selectedAdminCategory : 0,
    //   userCategory: !this.isAdmin ? this.selectedUserCategory : 0,
    //   type: this.selectedType ?? 0,
    //   time: this.selectedTime ?? 0,
    //   isAdmin: this.isAdmin,// Remove after Backend done
    //   notificationStatusSelected: selectedEnum
    // };
    // this.service
    //   .getNotifications(payload)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (res) => {
    //       if (res.result && res.data) {
    //         // map backend to UI cards
    //         this.notifications.set(
    //           res.data.notifications.map((notif) => mapNotification(notif, this.isAdmin))
    //         );
    //         // update tab counts
    //         this.tabCounts.set({
    //           [NotifcationTabName.All]: res.data.all ?? 0,
    //           [NotifcationTabName.Unread]: res.data.unread ?? 0,
    //           [NotifcationTabName.Read]: res.data.read ?? 0,
    //           [NotifcationTabName.Urgent]: res.data.urgent ?? 0,
    //         });
    //       } else {
    //         this.snackbarService.showError(
    //           platformMessages.errorTitle,
    //           res.message || platformMessages.errorMessage,
    //         );
    //       }
    //     },
    //     error: (err) => {
    //       this.snackbarService.showError(
    //         platformMessages.errorTitle,
    //         err?.error?.message || platformMessages.errorMessage,
    //       );
    //     },
    //   });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
