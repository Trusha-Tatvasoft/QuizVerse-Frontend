import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials } from '../../interfaces/login.interface';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FilledButtonComponent,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;

  signInButton: ButtonConfig = {
    label: 'Sign In',
    fontWeight: 500,
    variant: 'gradient',
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials: LoginCredentials = this.loginForm.value;

    this.authService.login(credentials).subscribe((response) => {
      if (response.success) {
      } else {
      }
    });
  }
}
