import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginCredentials } from '../../interfaces/login.interface';
import { LOGIN_FORM_FIELDS, SIGNIN_BUTTON_CONFIG } from '../../configs/login.component.config';
import { TogglePasswordDirective } from '../toggle-password.directive';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';
import { Navigations } from '../../../../shared/enums/navigation';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    FilledButtonComponent,
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TogglePasswordDirective,
    MatInputModule,
    MatFormField,
    RouterLink,
    MatCheckboxModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../login-signup/login-signup.component.scss'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly authService = inject(AuthService);
  private readonly snackbar = inject(SnackbarService);

  loginFields = LOGIN_FORM_FIELDS; // Field config for login form
  signInButton = SIGNIN_BUTTON_CONFIG; // Button config for sign-in

  loginForm: FormGroup;

  constructor() {
    // Create form controls using field config and validators
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

  getError(fieldName: string): string | null {
    const control = this.loginForm.get(fieldName);
    const field = this.loginFields.find((f) => f.name === fieldName);
    const customMessages = field?.validationMessages || {};

    return this.validationErrorService.getErrorMessage(control!, customMessages);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials: LoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      rememberMe: !!this.loginForm.value.rememberMe,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        const token = this.authService.getAccessToken();
        const role = token ? this.authService.getRoleFromToken(token) : null;

        if (role === 'admin') {
          this.snackbar.showSuccess('Welcome back!', 'You have been successfully logged in!');
          this.router.navigate([Navigations.Admin]);
        } else {
          this.router.navigate([Navigations.User]);
        }
      },
      error: () => {
        this.snackbar.showError('Login Falied!!');
      },
    });
  }
}
