import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  BACK_TO_SIGNIN_BUTTON,
  NEW_RESET_LINK_BUTTON,
} from '../../configs/reset-link-invalid.component.config';
import { Navigations } from '../../../../shared/enums/navigation';
import { Router, RouterLink } from '@angular/router';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';

@Component({
  selector: 'app-reset-link-invalid',
  imports: [MatIcon, FilledButtonComponent, OutlineButtonComponent, RouterLink],
  templateUrl: './reset-link-invalid.component.html',
  styleUrls: ['./reset-link-invalid.component.scss', '../login-signup/login-signup.component.scss'],
})
export class ResetLinkInvalidComponent {
  private readonly router = inject(Router);

  // Button config for requesting new reset link
  NewResetLinkButton = NEW_RESET_LINK_BUTTON;
  // Button config to go back to sign in
  BackToSignInButton = BACK_TO_SIGNIN_BUTTON;

  // Loading state for showing spinners
  isLoading = false;

  // Navigate to forgot password screen to request new reset link
  onRequestNewResetLink(): void {
    this.router.navigate([Navigations.ForgetPassword]);
  }

  // Navigate back to login screen
  onBackToSignInClick(): void {
    this.router.navigate([Navigations.Login]);
  }
}
