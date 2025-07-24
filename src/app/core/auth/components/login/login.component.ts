import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { LoginCredentials } from '../../interfaces/login.interface';
import { LOGIN_FORM_FIELDS, SIGNIN_BUTTON_CONFIG } from '../../configs/login.component.config';
import { TogglePasswordDirective } from '../toggle-password.directive';
/**
 * Login component handling:
 * - Reactive form setup and validation
 * - Loading state management
 * - Submission of login credentials
 */
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    FilledButtonComponent,
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TogglePasswordDirective,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../login-signup/login-signup.component.scss'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder); // Inject FormBuilder for reactive form

  loginFields = LOGIN_FORM_FIELDS; // Form field configurations
  loginForm: FormGroup; // Reactive form instance
  isLoading = false; // Loading state
  errorMessage = ''; // Error message
  signInButton = SIGNIN_BUTTON_CONFIG; // Sign-in button configuration

  constructor() {
    // Initialize form with controls based on LOGIN_FORM_FIELDS
    this.loginForm = this.fb.group(
      this.loginFields.reduce(
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
      ...this.signInButton,
      isDisabled: this.isLoading,
    };
  }

  /**
   * Handles form submission
   * - Marks form as touched if invalid
   * - Sets loading state and simulates processing delay
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
}
