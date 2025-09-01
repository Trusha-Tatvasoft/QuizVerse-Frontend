import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { CommonModule } from '@angular/common';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  cancelButtonConfig,
  createUserButtonConfig,
  registerButtonConfig,
  registerFormFields,
  updateUserButtonConfig,
  uploadButtonConfig,
  userFormFields,
} from '../../configs/register.component.config';
import { TogglePasswordDirective } from '../toggle-password.directive';
import { ValidationErrorService } from '../../../../shared/service/validation-error/validation-error.service';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { RegisterService } from '../../services/register.service';
import {
  allowedImageTypes,
  maxFileUploadSize,
  platformMessages,
} from '../../../../utils/constants';
import { RegisterCredential } from '../../interfaces/register.interface';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import { selectedTabIndexSignal } from '../login-signup/login-signup.component';
import { UserFormData } from '../../../../pages/admin/user-management/interfaces/user-form-data.interface';
import { FilenameTruncatePipe } from '../../../../shared/pipes/filename-truncate/filename-truncate.pipe';

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
    OutlineButtonComponent,
    FilenameTruncatePipe,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../login-signup/login-signup.component.scss'],
})
export class RegisterComponent implements OnDestroy {
  @Input() user: UserFormData | null = null;
  @Input() isLogin = false;
  @Input() isEditMode = false;

  @Output() saveUser = new EventEmitter<{ formData: FormData; isEdit: boolean }>();
  @Output() formCancelled = new EventEmitter<void>();

  registerFields = registerFormFields;
  userFields = userFormFields;
  registerButton = registerButtonConfig;
  uploadButton = uploadButtonConfig;
  cancelButton = cancelButtonConfig;
  updateUserButton = updateUserButtonConfig;
  createUserButton = createUserButtonConfig;

  registerForm: FormGroup;
  userForm: FormGroup;
  selectedFile: File | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly registerService = inject(RegisterService);
  private readonly destroy$ = new Subject<void>();

  // Initialize forms with dynamic fields and validators
  constructor() {
    const formControls = this.registerFields.reduce(
      (acc, field) => {
        acc[field.name] = ['', field.validators];
        return acc;
      },
      {} as Record<string, unknown>,
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
        {} as Record<string, unknown>,
      ),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEditMode'] && this.isEditMode) {
      // Remove password fields and validators in edit mode
      ['password', 'confirmPassword'].forEach((field) => {
        const control = this.userForm.get(field);
        if (control) {
          control.clearValidators();
          control.setValue('');
          control.updateValueAndValidity();
        }
      });

      // Optionally remove password fields from userFields UI-wise
      this.userFields = this.userFields.filter(
        (field) => field.name !== 'password' && field.name !== 'confirmPassword',
      );
    }

    if (changes['user'] && this.user) {
      this.userForm.patchValue({
        fullName: this.user.fullName || '',
        username: this.user.userName || '',
        email: this.user.email || '',
        bio: this.user.bio || '',
        profilePicture: this.user.profilePic || '',
      });
    }
  }

  get displayFileName(): string {
    if (this.selectedFile?.name) {
      return this.selectedFile.name;
    }

    const profilePicValue = this.userForm.get('profilePicture')?.value;

    if (typeof profilePicValue === 'string') {
      return profilePicValue.split('/').pop() || 'No file chosen';
    }

    return 'No file chosen';
  }

  // Get dynamic validation error message for a given field
  getError(fieldName: string): string | null {
    const form = this.isLogin ? this.userForm : this.registerForm;
    const fieldList = this.isLogin ? this.userFields : this.registerFields;

    const control = form.get(fieldName);
    const field = fieldList.find((f) => f.name === fieldName);
    const customMessages = field?.validationMessages || {};

    if (control?.errors?.['server']) {
      return control.errors['server'];
    }

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
      const allowedTypes = allowedImageTypes;

      control?.setErrors(null);

      if (file.size > maxFileUploadSize) {
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
              `${platformMessages.errorTitle} ${res.statusCode}`,
              res.message || platformMessages.errorMessage,
            );
            return;
          }

          this.snackbarService.showSuccess(
            'Success',
            res.message || platformMessages.registerSuccessfully,
          );

          // Switch to login tab after successful registration
          selectedTabIndexSignal.set(0);
        },
        error: (err) => {
          const message = err?.error?.message || platformMessages.errorMessage;
          this.snackbarService.showError('Error', message);
        },
      });
  }

  // Submit user form (for user update or create actions)
  createUserFormSubmit(): void {
    if (this.isEditMode) {
      ['password', 'confirmPassword'].forEach((field) => {
        const control = this.userForm.get(field);
        control?.clearValidators();
        control?.setValue('');
        control?.updateValueAndValidity();
      });
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const userFormData = new FormData();

    Object.entries(this.userForm.value).forEach(([key, value]) => {
      const skipInEdit = this.isEditMode && ['password', 'confirmPassword'].includes(key);
      if (skipInEdit || value === null || value === '') return;

      userFormData.append(key, String(value));
    });

    if (this.selectedFile) {
      userFormData.append('profilePic', this.selectedFile);
    }

    if (this.isEditMode && this.user?.id) {
      userFormData.append('id', String(this.user.id));
    }

    this.saveUser.emit({ formData: userFormData, isEdit: this.isEditMode });
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
  cancel(): void {
    this.formCancelled.emit();
  }

  // Check if username is available and set validation errors if not
  validateUserName(): void {
    const form = this.getActiveForm();
    const control = form.get('username');
    const value = control?.value?.trim();

    if (!value || control?.invalid) return;

    this.registerService
      .checkUserNameExists(value, this.isEditMode ? this.user?.id : undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (control?.hasError('server')) {
            delete control.errors?.['server'];
            control.updateValueAndValidity({ onlySelf: true });
          }
        },
        error: (err) => {
          const status = err.status;
          const message = err?.error?.message || platformMessages.errorMessage;

          if (status >= 400 && status < 500) {
            control?.setErrors({ server: message || 'Username already exists' });
            control?.markAsTouched();
          } else {
            this.snackbarService.showError(`${platformMessages.errorTitle} ${status}`, message);
          }
        },
      });
  }

  // Check if email is available only on add user and set validation errors if not
  validateEmail(): void {
    const form = this.getActiveForm();
    const control = form.get('email');
    const value = control?.value?.trim();

    if (this.isEditMode || !value || control?.invalid) return;

    this.registerService
      .checkEmailExists(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (control?.hasError('server')) {
            delete control.errors?.['server'];
            control.updateValueAndValidity({ onlySelf: true });
          }
        },
        error: (err) => {
          const status = err.status;
          const message = err?.error?.message || platformMessages.errorMessage;

          if (status >= 400 && status < 500) {
            control?.setErrors({ server: message || 'Email already exists' });
            control?.markAsTouched();
          } else {
            this.snackbarService.showError(`${platformMessages.errorTitle} ${status}`, message);
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Return active form based on login mode
  private getActiveForm(): FormGroup {
    return this.isLogin ? this.userForm : this.registerForm;
  }
}
