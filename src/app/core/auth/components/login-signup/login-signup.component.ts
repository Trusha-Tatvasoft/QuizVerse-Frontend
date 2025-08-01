import { Component } from '@angular/core';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import {
  facebookButtonConfig,
  googleButtonConfig,
  loginSignUpTabsConfig,
} from '../../configs/login-signup.component.config';
import { TabComponent } from '../../../../shared/components/tab/tab.component';
import { RouterLink } from '@angular/router';

// Login/Signup container component contains tab for login and signup forms

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
  selectedIndex = 0; // Active tab index
}
