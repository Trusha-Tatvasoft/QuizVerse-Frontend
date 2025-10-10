import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { loginFormFields, signInButtonConfig } from '../../configs/login.component.config';
import { TogglePasswordDirective } from '../toggle-password.directive';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';
import { Navigations } from '../../../../shared/enums/navigation';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { Subject, takeUntil } from 'rxjs';
import { LoginCredentials } from '../../interfaces/login.interface';
import { platformMessages } from '../../../../utils/constants';
import { Role } from '../../../../shared/enums/role';

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
export class LoginComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly authService = inject(AuthService);
  private readonly snackbar = inject(SnackbarService);

  private readonly destroy$ = new Subject<void>();

  loginFields = loginFormFields; // Field config for login form
  signInButton = signInButtonConfig; // Button config for sign-in

  loginForm: FormGroup;

  constructor() {
    // Create form controls using field config and validators
    this.loginForm = this.fb.group(
      this.loginFields.reduce(
        (acc, field) => {
          acc[field.name] = ['', field.validators];
          return acc;
        },
        {} as Record<string, unknown>,
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

    this.authService
      .login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const token = res.data.accessToken;
          const role = token ? this.authService.getRoleFromToken(token) : null;

          if (role === Role.Admin || role === Role.SuperAdmin) {
            this.router.navigate([`${Navigations.Admin}/${Navigations.Dashboard}`]);
          } else {
            this.router.navigate([`${Navigations.User}/${Navigations.Dashboard}`]);
          }
          this.snackbar.showSuccess(
            platformMessages.welcomeTitle,
            platformMessages.successfullLogin,
          );
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
