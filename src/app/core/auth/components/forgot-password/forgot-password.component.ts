import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ForgotCredential } from '../../interfaces/forgot.interface';
import {
  FORGOT_PASSWORD_FORM_FIELDS,
  SEND_RESET_LINK_CONFIG,
} from '../../configs/forgot-password.component.config';
import { Navigations } from '../../../../shared/enums/navigation';
import { MatFormField, MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-forgot-password',
  imports: [
    MatIconModule,
    FilledButtonComponent,
    ReactiveFormsModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatFormField,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: [
    './forgot-password.component.scss',
    '../login-signup/login-signup.component.scss',
    '../login/login.component.scss',
  ],
})
export class ForgotPasswordComponent {
  // Dependency injection for FormBuilder
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  forgotPasswordFields = FORGOT_PASSWORD_FORM_FIELDS;
  forgotPasswordForm: FormGroup;
  sendResetLinkButton = SEND_RESET_LINK_CONFIG;

  isLoading = false;
  errorMessage = '';

  constructor() {
    // Initialize reactive form using field config and validators
    this.forgotPasswordForm = this.fb.group(
      this.forgotPasswordFields.reduce(
        (acc, field) => {
          acc[field.name] = ['', field.validators];
          return acc;
        },
        {} as Record<string, any>,
      ),
    );
  }

  // Computed property for disabling button when loading
  get buttonConfig(): ButtonConfig {
    return {
      ...this.sendResetLinkButton,
      isDisabled: this.isLoading,
    };
  }

  // Handle form submission logic
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: ForgotCredential = {
      email: this.forgotPasswordForm.value.email,
    };

    // Simulate server request delay
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);

    // Navigate to confirmation page with email in state
    this.router.navigate([Navigations.ResetPasswordLinkSuccess], {
      state: { email: credentials.email },
    });
  }
}
