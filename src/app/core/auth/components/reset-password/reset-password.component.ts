import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import {
  RESET_PASSWORD_FOEM_FIELD,
  SEND_RESET_LINK_CONFIG,
} from '../../configs/reset-password.component.config';
import { ResetCredential } from '../../interfaces/reset-password.interface';
import { TogglePasswordDirective } from '../toggle-password.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  standalone: true,
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
export class ResetPasswordComponent {
  // Dependency injection using inject API
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Form configuration fields and UI state
  resetFields = RESET_PASSWORD_FOEM_FIELD;
  resetForm: FormGroup;
  sendResetLinkButton = SEND_RESET_LINK_CONFIG;

  isLoading = false;
  errorMessage = '';

  // Constructor to initialize form controls and validators
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

    // Add listener to revalidate when password changes
    this.resetForm.get('password')?.valueChanges.subscribe(() => {
      this.resetForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  trackByField(index: number, field: any): string {
    return field.name;
  }

  // Returns button configuration with loading state
  get buttonConfig(): ButtonConfig {
    return {
      ...this.sendResetLinkButton,
      isDisabled: this.isLoading,
    };
  }

  // Form-level custom validator to check if passwords match
  passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Form submit handler
  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: ResetCredential = {
      password: this.resetForm.value.password,
      confirmPassword: this.resetForm.value.confirmPassword,
    };

    setTimeout(() => {
      this.isLoading = false;
      // Handle API integration here
    }, 1000);
  }
}
