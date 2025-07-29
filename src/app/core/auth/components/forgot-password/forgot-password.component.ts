import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { ForgotCredential } from '../../interfaces/forgot.interface';
import {
  FORGOT_PASSWORD_FORM_FIELDS,
  SEND_RESET_LINK_CONFIG,
} from '../../configs/forgot-password.component.config';
import { Navigations } from '../../../../shared/enums/navigation';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { LoaderService } from '../../../../shared/service/loader/loader.service';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';

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
  ],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly loaderService = inject(LoaderService);
  private readonly validationErrorService = inject(ValidationErrorService);

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

    this.loaderService.show(); // Show global loader

    const credentials: ForgotCredential = {
      email: this.forgotPasswordForm.value.email,
    };

    // Simulate backend delay then hide loader
    setTimeout(() => {
      this.loaderService.hide();
    }, 1000);

    // Navigate to success page with email in router state
    this.router.navigate([Navigations.ResetPasswordLinkSuccess], {
      state: { email: credentials.email },
    });
  }
}
