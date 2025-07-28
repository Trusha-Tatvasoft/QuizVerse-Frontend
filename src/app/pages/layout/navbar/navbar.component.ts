import { Component, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TextButtonComponent } from '../../../shared/components/text-button/text-button.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import {
  DELETE_BUTTON_CONFIG,
  GET_STARTED_BUTTON_CONFIG,
  MARK_AS_ALL_READ_BUTTON_CONFIG,
  MARK_AS_READ_BUTTON_CONFIG,
  SIGN_IN_BUTTON_CONFIG,
  TEXT_BUTTON_CONFIG,
  VIEW_ALL_DETAILS_BUTTON_CONFIG,
  VIEW_DETAILS_BUTTON_CONFIG,
} from '../configs/navbar.component.config';
import { TagComponent } from '../../../shared/components/tag/tag.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { Notifications } from '../interfaces/navbar.component.interface';
import { Router } from '@angular/router';
import { Navigations } from '../../../shared/enums/navigation';
import { PlateformName } from '../../../utils/constants';

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

  private readonly router = inject(Router);

  textButton = TEXT_BUTTON_CONFIG;
  signInButton = SIGN_IN_BUTTON_CONFIG;
  getStartedButton = GET_STARTED_BUTTON_CONFIG;
  markAsReadButton = MARK_AS_READ_BUTTON_CONFIG;
  deleteButton = DELETE_BUTTON_CONFIG;
  viewDetailsButton = VIEW_DETAILS_BUTTON_CONFIG;
  markAsAllReadButton = MARK_AS_ALL_READ_BUTTON_CONFIG;
  viewAllButton = VIEW_ALL_DETAILS_BUTTON_CONFIG;
  plateformName = PlateformName;
  showNotifications = false;
  menuOpen = false;
  private previousWidth = window.innerWidth;

  ngOnInit(): void {
    this.checkWindowSize(window.innerWidth);
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    const currentWidth = window.innerWidth;
    this.checkWindowSize(currentWidth);
    this.previousWidth = currentWidth;
  }

  private checkWindowSize(currentWidth: number) {
    if (this.previousWidth >= 1024 && currentWidth < 1024) {
      this.menuOpen = false;
      this.closeSidebar.emit();
    }
  }

  toggleNotifications() {
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
}
