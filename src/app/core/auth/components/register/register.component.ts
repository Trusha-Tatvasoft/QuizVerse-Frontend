import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RegisterCredentials } from '../../interfaces/register.interface';
import {
  REGISTER_BUTTON_CONFIG,
  REGISTER_FORM_FIELDS,
} from '../../configs/register.component.config';
import { TogglePasswordDirective } from '../toggle-password.directive';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';

@Component({
  selector: 'app-register',
  standalone: true,
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
  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);

  registerFields = REGISTER_FORM_FIELDS;
  registerButton = REGISTER_BUTTON_CONFIG;

  registerForm: FormGroup;

  constructor() {
    // Create form group using fields and validators
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

  getError(fieldName: string): string | null {
    const control = this.registerForm.get(fieldName);
    const field = this.registerFields.find((f) => f.name === fieldName);
    const customMessages = field?.validationMessages || {};

    return this.validationErrorService.getErrorMessage(control!, customMessages, fieldName);
  }

  // Handle form submission with validation and simulated delay
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const credentials: RegisterCredentials = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };
  }
}
