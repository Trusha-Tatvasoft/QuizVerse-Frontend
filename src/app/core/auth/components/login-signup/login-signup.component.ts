import { Component } from '@angular/core';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import {
  FACEBOOK_BUTTON_CONFIG,
  GOOGLE_BUTTON_CONFIG,
  LOGIN_SIGNUP_TABS_CONFIG,
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
  googleButton = GOOGLE_BUTTON_CONFIG; // Google button configuration
  facebookButton = FACEBOOK_BUTTON_CONFIG; // Facebook button configuration
  tabs = LOGIN_SIGNUP_TABS_CONFIG; // Tabs for Sign In / Sign Up
  selectedIndex = 0; // Active tab index
}
