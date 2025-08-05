import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import {
  RESET_PASSWORD_FORM_FIELD,
  SEND_RESET_LINK_CONFIG,
} from '../../configs/reset-password.component.config';
import { ResetCredential } from '../../interfaces/forgot-reset-password.interface';
import { TogglePasswordDirective } from '../toggle-password.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { ForgotResetPasswordService } from '../../services/forgot-reset-password.service';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { PlatformMessages } from '../../../../utils/constants';
import { Navigations } from '../../../../shared/enums/navigation';

@Component({
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FilledButtonComponent,
    TogglePasswordDirective,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: [
    './reset-password.component.scss',
    '../login-signup/login-signup.component.scss',
    '../login/login.component.scss',
  ],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly authService = inject(ForgotResetPasswordService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  resetFields = RESET_PASSWORD_FORM_FIELD;
  sendResetLinkButton = SEND_RESET_LINK_CONFIG;

  resetForm: FormGroup;
  resetToken: string = '';

  private readonly destroy$ = new Subject<void>();

  constructor() {
    const formControls = this.resetFields.reduce(
      (acc, field) => {
        acc[field.name] = ['', field.validators];
        return acc;
      },
      {} as Record<string, any>,
    );

    this.resetForm = this.fb.group(formControls, {
      validators: this.passwordMatchValidator,
    });
  }

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.queryParamMap.get('token') || '';
    this.resetLinkValidation();
  }

  resetLinkValidation() {
    if (!this.resetToken) {
      this.router.navigate([Navigations.ResetLinkInvalid]);
      return;
    }

    this.authService
      .verifyResetToken(this.resetToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200 || res.data === false) {
            this.snackbarService.showError(
              `${PlatformMessages.errorTitle} ${res.statusCode}`,
              res.message || PlatformMessages.errorMessage,
            );

            this.router.navigate([Navigations.ResetLinkInvalid]);
          }
        },
        error: (err) => {
          const message = err?.error?.message || PlatformMessages.errorMessage;
          this.snackbarService.showError('Error', message);

          this.router.navigate([Navigations.ResetLinkInvalid]);
        },
      });
  }

  getError(fieldName: string): string | null {
    const control = this.resetForm.get(fieldName);
    const field = this.resetFields.find((f) => f.name === fieldName);
    const customMessages = field?.validationMessages || {};

    return this.validationErrorService.getErrorMessage(control!, customMessages, fieldName);
  }

  passwordMatchValidator(formGroup: FormGroup): null {
    const password = formGroup.get('password')?.value;
    const confirmPasswordControl = formGroup.get('confirmPassword');

    if (confirmPasswordControl?.value && password !== confirmPasswordControl?.value) {
      confirmPasswordControl?.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPasswordControl?.hasError('passwordMismatch')) {
        confirmPasswordControl.setErrors(null);
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const credentials: ResetCredential = {
      password: this.resetForm.value.password,
      resetPasswordToken: this.resetToken,
    };

    this.authService
      .resetPassword(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200) {
            this.snackbarService.showError(
              `${PlatformMessages.errorTitle} ${res.statusCode}`,
              res.message || PlatformMessages.errorMessage,
            );

            this.router.navigate([Navigations.ForgetPassword]);
            return;
          }

          this.snackbarService.showSuccess(
            'Success',
            res.message || PlatformMessages.passwordResetSuccess,
          );

          this.router.navigate([Navigations.Login]);
        },
        error: (err) => {
          const message = err?.error?.message || PlatformMessages.errorMessage;
          this.snackbarService.showError('Error', message);

          this.router.navigate([Navigations.ForgetPassword]);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
