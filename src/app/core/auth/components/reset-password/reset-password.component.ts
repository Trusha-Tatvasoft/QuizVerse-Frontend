import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import {
  RESET_PASSWORD_FOEM_FIELD,
  SEND_RESET_LINK_CONFIG,
} from '../../configs/reset-password.component.config';
import { ResetCredential } from '../../interfaces/reset-password.interface';
import { TogglePasswordDirective } from '../toggle-password.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderService } from '../../../../shared/service/loader/loader.service';

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
  private readonly router = inject(Router); // For navigation if needed
  private readonly loaderService = inject(LoaderService); // For managing loading state

  resetFields = RESET_PASSWORD_FOEM_FIELD;
  resetForm: FormGroup;
  sendResetLinkButton = SEND_RESET_LINK_CONFIG;

  errorMessage = '';

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

    // Updates confirmPassword validation if password changes
    this.resetForm.get('password')?.valueChanges.subscribe(() => {
      this.resetForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  // Tracks form fields by name to optimize rendering
  trackByField(index: number, field: any): string {
    return field.name;
  }

  // Validates if password and confirmPassword match
  passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword');
    if (!confirmPassword) return null;

    const confirmControl = confirmPassword;
    const errors = confirmControl.errors || {};

    if (password !== confirmControl.value) {
      errors['passwordMismatch'] = true;
      confirmControl.setErrors(errors);
    } else {
      if (errors['passwordMismatch']) {
        delete errors['passwordMismatch'];
        confirmControl.setErrors(Object.keys(errors).length ? errors : null);
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

    this.loaderService.show();
    this.errorMessage = '';

    const credentials: ResetCredential = {
      password: this.resetForm.value.password,
      confirmPassword: this.resetForm.value.confirmPassword,
    };

    setTimeout(() => {
      this.loaderService.hide();
      // API integration goes here
    }, 1000);
  }
}
