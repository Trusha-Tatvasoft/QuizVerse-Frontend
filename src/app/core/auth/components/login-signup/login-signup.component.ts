import { Component, effect, signal } from '@angular/core';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import {
  facebookButtonConfig,
  googleButtonConfig,
  loginSignUpTabsConfig,
} from '../../configs/login-signup.component.config';
import { TabComponent } from '../../../../shared/components/tab/tab.component';
import { RouterLink } from '@angular/router';

export const selectedTabIndexSignal = signal<number>(0);

@Component({
  selector: 'app-login-signup',
  imports: [OutlineButtonComponent, TabComponent, RouterLink],
  templateUrl: './login-signup.component.html',
  styleUrl: './login-signup.component.scss',
})
export class LoginSignupComponent {
  googleButton = googleButtonConfig; // Google button configuration
  facebookButton = facebookButtonConfig; // Facebook button configuration
  tabs = loginSignUpTabsConfig; // Tabs for Sign In / Sign Up
  selectedIndex = selectedTabIndexSignal(); // Active tab index

  constructor() {
    effect(() => {
      this.selectedIndex = selectedTabIndexSignal();
    });
  }

  switchToTab(index: number) {
    selectedTabIndexSignal.set(index);
  }
}
