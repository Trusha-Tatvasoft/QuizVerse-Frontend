import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { loginFormFields, signInButtonConfig } from '../../configs/login.component.config';
import { TogglePasswordDirective } from '../toggle-password.directive';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';

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
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../login-signup/login-signup.component.scss'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);

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
    // If form is invalid, mark all fields as touched to trigger validation messages
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Extract and simulate handling login credentials
    // const credentials: LoginCredentials = {
    //   email: this.loginForm.value.email,
    //   password: this.loginForm.value.password,
    // };
  }
}
