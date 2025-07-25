import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  BACK_TO_SIGNIN_CONFIG,
  SEND_ANOTHER_EMAIL_CONFIG,
} from '../../configs/reset-link-send-successfully.component.config';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import { Navigations } from '../../../../shared/enums/navigation';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-link-send-successfully',
  imports: [MatIconModule, FilledButtonComponent, OutlineButtonComponent, RouterLink],
  templateUrl: './reset-link-send-successfully.component.html',
  styleUrls: [
    './reset-link-send-successfully.component.scss',
    '../login-signup/login-signup.component.scss',
  ],
})
export class ResetLinkSendSuccessfullyComponent {
  private readonly router = inject(Router);

  // Email address passed from previous route state
  @Input() email: string;

  // Button configurations
  loginButton = BACK_TO_SIGNIN_CONFIG;
  sendAnotherEmailButton = SEND_ANOTHER_EMAIL_CONFIG;

  // Loading state for the buttons
  isLoading = false;

  // OnInit lifecycle hook to extract email from navigation state
  ngOnInit() {
    const state = window.history.state as { email?: string };
    this.email = state?.email || '';
  }

  // Handler for "Send Another Email" button
  onSendAnotherEmailClick() {
    this.router.navigate([Navigations.ForgetPassword]);
  }

  // Handler for "Back to Sign In" button
  onSignInClick() {
    this.router.navigate([Navigations.Login]);
  }
}
