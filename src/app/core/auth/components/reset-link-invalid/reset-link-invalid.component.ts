import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  backToSignInButton,
  newResetLinkButton,
} from '../../configs/reset-link-invalid.component.config';
import { Navigations } from '../../../../shared/enums/navigation';
import { Router, RouterLink } from '@angular/router';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import { LoaderService } from '../../../../shared/service/loader/loader.service';

@Component({
  selector: 'app-reset-link-invalid',
  imports: [MatIcon, FilledButtonComponent, OutlineButtonComponent, RouterLink],
  templateUrl: './reset-link-invalid.component.html',
  styleUrls: ['./reset-link-invalid.component.scss', '../login-signup/login-signup.component.scss'],
})
export class ResetLinkInvalidComponent {
  private readonly router = inject(Router);
  private readonly loaderService = inject(LoaderService);

  NewResetLinkButton = newResetLinkButton;
  BackToSignInButton = backToSignInButton;

  // Navigate to forgot password screen to request new reset link
  onRequestNewResetLink(): void {
    this.router.navigate([Navigations.ForgetPassword]);
  }

  // Navigate back to login screen
  onBackToSignInClick(): void {
    this.router.navigate([Navigations.Login]);
  }
}
