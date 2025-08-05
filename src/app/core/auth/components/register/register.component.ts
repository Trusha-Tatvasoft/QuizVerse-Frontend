import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  CANCEL_BUTTON_CONFIG,
  CREATE_USER_BUTTON_CONFIG,
  REGISTER_BUTTON_CONFIG,
  REGISTER_FORM_FIELDS,
  UPDATE_USER_BUTTON_CONFIG,
  UPLOAD_BUTTON_CONFIG,
  USER_FORM_FIELDS,
} from '../../configs/register.component.config';
import { TogglePasswordDirective } from '../toggle-password.directive';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { RegisterService } from '../../services/register.service';
import { PlatformMessages } from '../../../../utils/constants';
import { RegisterCredential } from '../../interfaces/register.interface';
import { TextButtonComponent } from '../../../../shared/components/text-button/text-button.component';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import { selectedTabIndexSignal } from '../login-signup/login-signup.component';

@Component({
  selector: 'app-register',
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
    TextButtonComponent,
    OutlineButtonComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../login-signup/login-signup.component.scss'],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly registerService = inject(RegisterService);

  registerFields = REGISTER_FORM_FIELDS;
  userFields = USER_FORM_FIELDS;
  registerButton = REGISTER_BUTTON_CONFIG;
  uploadButton = UPLOAD_BUTTON_CONFIG;
  cancelButton = CANCEL_BUTTON_CONFIG;
  updateUserButton = UPDATE_USER_BUTTON_CONFIG;
  createUserButton = CREATE_USER_BUTTON_CONFIG;

  isLogin = false;
  isEditMode = false;
  selectedFile: File | null = null;

  registerForm: FormGroup;
  userForm: FormGroup;

  private readonly destroy$ = new Subject<void>();

  // Initialize forms with dynamic fields and validators
  constructor() {
    const formControls = this.registerFields.reduce(
      (acc, field) => {
        acc[field.name] = ['', field.validators];
        return acc;
      },
      {} as Record<string, any>,
    );

    this.registerForm = this.fb.group(formControls, {
      validators: this.passwordMatchValidator,
    });

    this.userForm = this.fb.group(
      this.userFields.reduce(
        (acc, field) => {
          acc[field.name] = ['', field.validators];
          return acc;
        },
        {} as Record<string, any>,
      ),
    );
  }

  // Get dynamic validation error message for a given field
  getError(fieldName: string): string | null {
    const form = this.isLogin ? this.userForm : this.registerForm;
    const fieldList = this.isLogin ? this.userFields : this.registerFields;

    const control = form.get(fieldName);
    const field = fieldList.find((f) => f.name === fieldName);
    const customMessages = field?.validationMessages || {};

    return this.validationErrorService.getErrorMessage(control!, customMessages, fieldName);
  }

  // Custom validator to ensure password and confirmPassword match
  passwordMatchValidator(formGroup: FormGroup): null {
    const password = formGroup.get('password')?.value;
    const confirmPasswordControl = formGroup.get('confirmPassword');

    if (confirmPasswordControl?.value && password !== confirmPasswordControl?.value) {
      confirmPasswordControl?.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPasswordControl?.hasError('passwordMismatch')) {
        confirmPasswordControl.setErrors(null);
      }
    }
    return null;
  }

  // Handle profile picture file selection and validation
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const control = this.userForm.get('profilePicture');

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/jpeg', 'image/png'];

      control?.setErrors(null);

      if (file.size > 5 * 1024 * 1024) {
        control?.setErrors({ fileSize: true });
        control?.markAsTouched();
        this.selectedFile = null;
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        control?.setErrors({ fileType: true });
        control?.markAsTouched();
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
    }
  }

  // Submit register form and call API to create user
  registerFormSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const credentials: RegisterCredential = {
      fullName: this.registerForm.value.fullName,
      userName: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
      bio: this.registerForm.value.bio || '',
    };

    this.registerService
      .registerUser(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 201) {
            this.snackbarService.showError(
              `${PlatformMessages.errorTitle} ${res.statusCode}`,
              res.message || PlatformMessages.errorMessage,
            );
            return;
          }

          this.snackbarService.showSuccess(
            'Success',
            res.message || PlatformMessages.registerSuccessfully,
          );

          // Switch to login tab after successful registration
          selectedTabIndexSignal.set(0);
        },
        error: (err) => {
          const message = err?.error?.message || PlatformMessages.errorMessage;
          this.snackbarService.showError('Error', message);
        },
      });
  }

  // Submit user form (for user update or create actions)
  createUserFormSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    // Add submission logic
  }

  // Determine which form to submit based on tab
  onSubmit(): void {
    if (!this.isLogin) {
      this.registerFormSubmit();
    } else {
      this.createUserFormSubmit();
    }
  }

  // Handle cancel button click
  onCancel(): void {}
}
