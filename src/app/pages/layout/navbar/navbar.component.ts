import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TextButtonComponent } from '../../../shared/components/text-button/text-button.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import {
  deleteButtonConfig,
  getNotificationRoute,
  getStartedButtonConfig,
  markAsAllReadButtonConfig,
  markAsReadButtonConfig,
  signInButtonConfig,
  textButtonConfig,
  viewAllDetailsButtonConfig,
  viewDetailsButtonConfig,
} from '../configs/navbar.component.config';
import { TagComponent } from '../../../shared/components/tag/tag.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { Notifications } from '../interfaces/navbar.component.interface';
import { Router } from '@angular/router';
import { Navigations } from '../../../shared/enums/navigation';
import { plateformName, platformMessages, roles } from '../../../utils/constants';
import { AuthService } from '../../../core/auth/services/auth.service';
import { PlatformSettingsService } from '../../../services/admin/platform-settings/platform-settings.service';
import { NavbarDataService } from '../../../services/common/navbar/navbar-data.service';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { environment } from '../../../../environments/environment.dev';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago/time-ago.pipe';
import { UserProfileService } from '../../../services/user/user-profile/user-profile.service';
import { selectedTabIndexSignal } from '../../../core/auth/components/login-signup/login-signup.component';
import { globalGetInitials } from '../../../utils/get-profile-initials.utils';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatButtonModule,
    TextButtonComponent,
    FilledButtonComponent,
    TagComponent,
    ProgressBarComponent,
    OutlineButtonComponent,
    TimeAgoPipe,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() isLogin = false;
  @Input() isAdmin = false;

  @Output() openSidebar = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();

  @ViewChild('notificationWrapper') notificationWrapper!: ElementRef;

  role: string | null = null;

  textButton = textButtonConfig;
  signInButton = signInButtonConfig;
  getStartedButton = getStartedButtonConfig;
  markAsReadButton = markAsReadButtonConfig;
  deleteButton = deleteButtonConfig;
  viewDetailsButton = viewDetailsButtonConfig;
  markAsAllReadButton = markAsAllReadButtonConfig;
  viewAllButton = viewAllDetailsButtonConfig;
  plateformName = plateformName;
  showNotifications = false;
  menuOpen = false;
  isImageError: boolean = false;
  logoPath: string | null;
  currentXp = 0;
  progressPercentage: number = 0;
  profileImageUrl: string = 'assets/images/profile-1.png';
  notificationCount = 99;
  notifications: Notifications[] = [];

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly platformSettingsService = inject(PlatformSettingsService);
  private readonly navbarService = inject(NavbarDataService);
  //NOTE: Uncomment and use after backend API is implemented to fetch and display notifications
  // private readonly notificationCenterService = inject(NotificationCenterService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly userProfileService = inject(UserProfileService);

  private readonly destroy$ = new Subject<void>();
  private previousWidth = window.innerWidth;

  ngOnInit(): void {
    this.checkWindowSize(window.innerWidth);

    this.authService.currentRole$.subscribe((role) => {
      this.role = role;
    });
    this.loadPlatformConfig();

    if (this.isLogin) {
      this.loadUserData();
    }

    this.userProfileService.profileUpdated$.pipe(takeUntil(this.destroy$)).subscribe((updated) => {
      if (updated) {
        this.loadUserData();
      }
    });
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    const currentWidth = window.innerWidth;
    this.checkWindowSize(currentWidth);
    this.previousWidth = currentWidth;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.showNotifications &&
      this.notificationWrapper &&
      !this.notificationWrapper.nativeElement.contains(event.target)
    ) {
      this.showNotifications = false;
    }
  }

  toggleNotifications(event: Event) {
    event.stopPropagation(); // prevent immediate close
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  getStartedRedirect() {
    this.router.navigate([Navigations.Login]);
    selectedTabIndexSignal.set(1);
  }

  signInRedirect(): void {
    this.router.navigate([Navigations.Login]);
    selectedTabIndexSignal.set(0);
  }

  toggleSidebar(): void {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      this.openSidebar.emit();
    } else {
      this.closeSidebar.emit();
    }
  }

  sidebarClosedByBackdrop(): void {
    this.menuOpen = false;
    this.closeSidebar.emit();
  }

  goToProfile() {
    const route =
      this.role === roles.admin
        ? `/${Navigations.Admin}/${Navigations.Profile}`
        : `/${Navigations.User}/${Navigations.Profile}`;

    this.router.navigate([route]);
  }

  goToSetting() {
    const route =
      this.role === roles.admin
        ? `/${Navigations.Admin}/${Navigations.Profile}/`
        : `/${Navigations.User}/${Navigations.Profile}`;

    this.router.navigate([route], { queryParams: { tab: 2 } });
  }

  logout() {
    this.authService.logout();
  }

  navigateToDashboard(): void {
    if (!this.isLogin) {
      this.router.navigate([Navigations.Login]);
      selectedTabIndexSignal.set(0);
      return;
    }

    switch (this.role) {
      case roles.admin:
        this.router.navigate([`/${Navigations.Admin}/${Navigations.Dashboard}`]);
        break;
      case roles.player:
        this.router.navigate([`/${Navigations.User}/${Navigations.Dashboard}`]);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }

  imageError() {
    this.logoPath = null;
  }

  profileImageError() {
    this.profileImageUrl = 'assets/images/profile-1.png';
    this.isImageError = true;
  }

  //NOTE: Uncomment and use after backend API is implemented to fetch and display notifications
  markAsRead(id: string) {
    // this.notificationCenterService.markAsRead(id).pipe(takeUntil(this.destroy$)).subscribe({
    //   next: (res) => {
    //     if (res.result) {
    //       this.snackbarService.showError(
    //         platformMessages.successTitle,
    //         res.message
    //       );
    //       this.loadNotifications();
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
    // this.notificationCenterService.deleteNotification(id).pipe(takeUntil(this.destroy$)).subscribe({
    //   next: (res) => {
    //     if (res.result) {
    //       this.loadNotifications();
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

  viewAllNotifications() {
    this.showNotifications = false;
    const route =
      this.role === roles.admin
        ? `/${Navigations.Admin}/${Navigations.Notifications}/`
        : `/${Navigations.User}/${Navigations.Notifications}`;
    this.router.navigate([route]);
  }

  viewDetails(category: number) {
    const { path, queryParams } = getNotificationRoute(this.role === roles.admin, category);
    this.router.navigate([path], { queryParams });
  }

  getInitials(name: string): string {
    return globalGetInitials(name);
  }

  //NOTE: Uncomment and use after backend API is implemented to fetch and display notifications
  markAsAllRead() {
    // this.notificationCenterService
    //   .markAllAsRead()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (res) => {
    //       if (res.result) {
    //         this.snackbarService.showSuccess(
    //           platformMessages.successTitle,
    //           res.message
    //         );
    //         this.loadNotifications();
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkWindowSize(currentWidth: number) {
    if (this.previousWidth >= 1024 && currentWidth < 1024) {
      this.menuOpen = false;
      this.closeSidebar.emit();
    }
  }

  private loadPlatformConfig(): void {
    this.platformSettingsService.platformConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        if (config) {
          this.logoPath = config.logo ?? null;
        }
      });
  }

  private loadUserData() {
    this.navbarService
      .getNavbarData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result) {
            this.currentXp = res.data.currentUserXp ?? 0;
            this.progressPercentage = res.data.progressPercentage ?? 0;
            this.notificationCount = res.data.notificationCount;
            this.profileImageUrl = res.data.profilePic
              ? `${environment.imageBaseUrl}/${res.data.profilePic}`
              : 'assets/images/profile-1.png';
          }
        },
        error: (err) => {
          this.snackbarService.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  //NOTE: Uncomment and use after backend API is implemented to fetch and display notifications
  private loadNotifications(): void {
    // const payload: NotificationCenterRequest = {
    //   searchText: '',
    //   adminCategory: 0,
    //   userCategory: 0,
    //   type: 0,
    //   time: 0,
    //   isAdmin: this.role === roles.admin,
    //   notificationStatusSelected: 0
    // }; // Remove after Backend done
    // this.notificationCenterService
    //   .getNotifications(payload)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (res) => {
    //       if (res.result && res.data) {
    //         this.notifications = res.data.notifications.map((notif) =>
    //           mapNotification(notif, this.isAdmin)
    //         );
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
}
