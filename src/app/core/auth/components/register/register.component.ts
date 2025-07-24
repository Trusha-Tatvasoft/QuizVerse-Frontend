import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { RegisterCredentials } from '../../interfaces/register.interface';
import {
  REGISTER_BUTTON_CONFIG,
  REGISTER_FORM_FIELDS,
} from '../../configs/register.component.config';
import { TogglePasswordDirective } from '../toggle-password.directive';

/**
 * Register component handling:
 * - Reactive form setup and validation
 * - Loading state management
 * - Submission of registration credentials
 */
@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    FilledButtonComponent,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TogglePasswordDirective,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../login-signup/login-signup.component.scss'],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder); // Inject FormBuilder for reactive form
  registerFields = REGISTER_FORM_FIELDS; // Form field configurations
  registerForm: FormGroup; // Reactive form instance
  isLoading = false; // Loading state
  errorMessage = ''; // Error message
  registerButton = REGISTER_BUTTON_CONFIG; // Register button configuration

  constructor() {
    // Initialize form with controls based on REGISTER_FORM_FIELDS
    this.registerForm = this.fb.group(
      this.registerFields.reduce(
        (acc, field) => {
          acc[field.name] = ['', field.validators];
          return acc;
        },
        {} as Record<string, any>,
      ),
    );
  }

  /**
   * Returns button config with dynamic disabled state based on loading
   */
  get buttonConfig(): ButtonConfig {
    return {
      ...this.registerButton,
      isDisabled: this.isLoading,
    };
  }

  /**
   * Handles form submission
   * - Marks form as touched if invalid
   * - Sets loading state and simulates processing delay
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: RegisterCredentials = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
}
