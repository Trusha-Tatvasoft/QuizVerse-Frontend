import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
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
import { plateformName } from '../../../utils/constants';
import { AuthService } from '../../../core/auth/services/auth.service';

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
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @Input() isLogin = false;
  @Input() isAdmin = false;
  @Input() currentXp = 0;
  @Input() xpLimit = 1000;
  @Input() profileImageUrl: string = 'assets/images/profile-1.png';
  @Input() notificationCount = 99;
  @Input() notifications: Notifications[] = [];

  @Output() openSidebar = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();
  @ViewChild('notificationWrapper') notificationWrapper!: ElementRef;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly elementRef = inject(ElementRef);

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
  private previousWidth = window.innerWidth;

  ngOnInit(): void {
    this.checkWindowSize(window.innerWidth);

    this.authService.currentRole$.subscribe((role) => {
      this.role = role;
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

  private checkWindowSize(currentWidth: number) {
    if (this.previousWidth >= 1024 && currentWidth < 1024) {
      this.menuOpen = false;
      this.closeSidebar.emit();
    }
  }

  toggleNotifications(event: Event) {
    event.stopPropagation(); // prevent immediate close
    this.showNotifications = !this.showNotifications;
  }

  browseQuizRedirect() {
    this.router.navigate([Navigations.BrowseQuizzes]);
  }

  loginRedirect(): void {
    this.router.navigate([Navigations.Login]);
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
      this.role === 'admin'
        ? `/${Navigations.Admin}/${Navigations.Profile}`
        : `/${Navigations.User}/${Navigations.Profile}`;

    this.router.navigate([route]);
  }

  goToSetting() {
    const route =
      this.role === 'admin'
        ? `/${Navigations.Admin}/${Navigations.Profile}/`
        : `/${Navigations.User}/${Navigations.Profile}`;

    this.router.navigate([route], { queryParams: { tab: 2 } });
  }

  logout() {
    this.authService.logout();
  }
}
