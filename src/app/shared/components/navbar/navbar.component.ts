import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TextButtonComponent } from '../text-button/text-button.component';
import { FilledButtonComponent } from '../filled-button/filled-button.component';
import {
  DELETE_BUTTON_CONFIG,
  GET_STARTED_BUTTON_CONFIG,
  MARK_AS_ALL_READ_BUTTON_CONFIG,
  MARK_AS_READ_BUTTON_CONFIG,
  SIGN_IN_BUTTON_CONFIG,
  TEXT_BUTTON_CONFIG,
  VIEW_ALL_DETAILS_BUTTON_CONFIG,
  VIEW_DETAILS_BUTTON_CONFIG,
} from '../../configs/navbar.component.config';
import { TagComponent } from '../tag/tag.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { OutlineButtonComponent } from '../outline-button/outline-button.component';
import { Notifications } from '../../interfaces/navbar.component.interface';

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
  @Input() profileImageUrl: string = 'assets/images/profile.png';
  @Input() notificationCount = 99;
  @Input() notifications: Notifications[] = [];

  textButton = TEXT_BUTTON_CONFIG;
  signInButton = SIGN_IN_BUTTON_CONFIG;
  getStartedButton = GET_STARTED_BUTTON_CONFIG;
  markAsReadButton = MARK_AS_READ_BUTTON_CONFIG;
  deleteButton = DELETE_BUTTON_CONFIG;
  viewDetailsButton = VIEW_DETAILS_BUTTON_CONFIG;
  markAsAllReadButton = MARK_AS_ALL_READ_BUTTON_CONFIG;
  viewAllButton = VIEW_ALL_DETAILS_BUTTON_CONFIG;

  showNotifications = false;

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }
}
