import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import {
  FORGOT_PASSWORD_FORM_FIELDS,
  SEND_RESET_LINK_CONFIG,
} from '../../configs/forgot-password.component.config';
import { Navigations } from '../../../../shared/enums/navigation';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { ForgotCredential } from '../../interfaces/forgot-reset-password.interface';
import { Subject, takeUntil } from 'rxjs';
import { ForgotResetPasswordService } from '../../services/forgot-reset-password.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { PlatformMessages } from '../../../../utils/constants';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
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
    '../reset-password/reset-password.component.scss',
  ],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly authService = inject(ForgotResetPasswordService);
  private readonly destroy$ = new Subject<void>();
  private readonly snackbarService = inject(SnackbarService);

  forgotPasswordFields = FORGOT_PASSWORD_FORM_FIELDS;
  forgotPasswordForm: FormGroup;
  sendResetLinkButton = SEND_RESET_LINK_CONFIG;

  constructor() {
    // Build reactive form using config field definitions and validators
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

  getError(fieldName: string): string | null {
    const control = this.forgotPasswordForm.get(fieldName);
    const field = this.forgotPasswordFields.find((f) => f.name === fieldName);
    const customMessages = field?.validationMessages || {};

    return this.validationErrorService.getErrorMessage(control!, customMessages);
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const credentials: ForgotCredential = {
      email: this.forgotPasswordForm.value.email,
    };

    this.authService
      .sendResetLink(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200) {
            this.snackbarService.showError(
              `${PlatformMessages.errorTitle} ${res.statusCode}`,
              res.message || PlatformMessages.errorMessage,
            );
            return;
          }

          this.snackbarService.showSuccess(
            'Success',
            res.message || `${PlatformMessages.resetLinkSendSuccessfully}`,
          );

          this.router.navigate([Navigations.ResetPasswordLinkSuccess], {
            state: { email: credentials.email },
          });
        },
        error: (err) => {
          const message = err?.error?.message || PlatformMessages.errorMessage;
          this.snackbarService.showError(`Error`, message);
        },
      });
  }
}
