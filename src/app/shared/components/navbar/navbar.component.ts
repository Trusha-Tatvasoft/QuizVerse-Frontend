import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SearchInputComponent } from '../search-input/search-input.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TextButtonComponent } from '../text-button/text-button.component';
import { FilledButtonComponent } from '../filled-button/filled-button.component';
import {
  GET_STARTED_BUTTON_CONFIG,
  SIGN_IN_BUTTON_CONFIG,
  TEXT_BUTTON_CONFIG,
} from '../../configs/navbar.component.config';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatButtonModule,
    SearchInputComponent,
    TextButtonComponent,
    FilledButtonComponent,
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

  textButton = TEXT_BUTTON_CONFIG;
  signInButton = SIGN_IN_BUTTON_CONFIG;
  getStartedButton = GET_STARTED_BUTTON_CONFIG;

  showNotifications = false;

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  getXpProgress(): number {
    return (this.currentXp / this.xpLimit) * 100;
  }

  onSearch(value: string): void {
    // console.log('Search:', value);
  }
}
