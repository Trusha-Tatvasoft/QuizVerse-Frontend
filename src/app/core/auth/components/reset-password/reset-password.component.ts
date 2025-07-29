import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import {
  RESET_PASSWORD_FOEM_FIELD,
  SEND_RESET_LINK_CONFIG,
} from '../../configs/reset-password.component.config';
import { ResetCredential } from '../../interfaces/forgot-reset-password.interface';
import { TogglePasswordDirective } from '../toggle-password.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';

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
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder); // For creating form group
  private readonly validationErrorService = inject(ValidationErrorService);

  resetFields = RESET_PASSWORD_FOEM_FIELD;
  resetForm: FormGroup;
  sendResetLinkButton = SEND_RESET_LINK_CONFIG;

  // Initializes form controls and attaches validator
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

  // Tracks form fields by name to optimize rendering
  trackByField(index: number, field: any): string {
    return field.name;
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
      // Clear error if previously set and now matched
      if (confirmPasswordControl?.hasError('passwordMismatch')) {
        confirmPasswordControl.setErrors(null);
      }
    }
    return null;
  }

  // Handles form submission and simulates API call
  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const credentials: ResetCredential = {
      password: this.resetForm.value.password,
      confirmPassword: this.resetForm.value.confirmPassword,
    };
  }
}
