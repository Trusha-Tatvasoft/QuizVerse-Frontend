import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  allowedImageTypes,
  defaultProfilePic,
  maxOtpAttempts,
  platformMessages,
} from '../../../utils/constants';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import {
  adminProfileFormFields,
  adminProfilePageHeader,
  updateAdminProfileButtonConfig,
} from './configs/admin-profile.component.config';
import { cancelButtonConfig } from '../../../core/auth/configs/register.component.config';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { UserProfileService } from '../../../services/user/user-profile/user-profile.service';
import { interval, Subject, Subscription, take, takeUntil } from 'rxjs';
import {
  AdminProfileUpdatedData,
  AdminUserProfileFormData,
} from './interface/admin-profile.component.interface';
import { environment } from '../../../../environments/environment.dev';
import { ValidationErrorService } from '../../../shared/service/validation-error/validation-error.service';
import {
  resendOtpButtonConfig,
  sendOtpButtonConfig,
  verifyOtpButtonConfig,
} from '../../user/user-profile/configs/profile-setting.config';
import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';
import { MatTooltip } from '@angular/material/tooltip';
import { DynamicFormField } from '../../../shared/interfaces/dynamic-form-field.interface';

@Component({
  selector: 'app-admin-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIcon,
    MatFormField,
    MatInputModule,
    PageHeaderComponent,
    FilledButtonComponent,
    OutlineButtonComponent,
    MatTooltip,
  ],
  templateUrl: './admin-profile.component.html',
  styleUrls: [
    './admin-profile.component.scss',
    '../../user/user-profile/user-profile.component.scss',
  ],
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  profilePicUrl = defaultProfilePic;
  verifyOtpBtn = verifyOtpButtonConfig;
  cancelButton = cancelButtonConfig;
  updateProfileButton = updateAdminProfileButtonConfig;
  sendOtpBtn = sendOtpButtonConfig;
  resendOtpBtn = resendOtpButtonConfig;
  maxOtpAttempts = maxOtpAttempts;
  isImageError: boolean = false;

  adminProfileConfig = adminProfilePageHeader;
  adminProfileForm: FormGroup;
  adminProfileFields: DynamicFormField[] = adminProfileFormFields;

  otpSent = signal(false);
  lastTypedEmail = '';
  otpVerified = signal(false);
  verifiedEmail = signal<string | null>(null);
  countdown = signal(0);
  emailOtpAttempts = new Map<string, number>();
  backendEmail = signal<string>('');
  countdownSub?: Subscription;
  serverErrors: { [key: string]: string } = {};
  otpButtonConfig = signal<ButtonConfig>(sendOtpButtonConfig);

  private readonly fb = inject(FormBuilder);
  private readonly snackbar = inject(SnackbarService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly validationErrorService = inject(ValidationErrorService);

  private readonly destroy$ = new Subject<void>();

  headerFullName: string = '—';
  headerEmail: string = '—';

  ngOnInit(): void {
    this.buildForm();
    this.loadAdminProfile();
  }

  // #region Build Form
  buildForm() {
    const formControls = this.adminProfileFields.reduce(
      (acc, field) => {
        acc[field.name] = ['', field.validators || []];
        return acc;
      },
      {} as Record<string, unknown>,
    );

    this.adminProfileForm = this.fb.group(formControls);
  }

  getError(fieldName: string): string | null {
    const control = this.adminProfileForm.get(fieldName);
    if (!control) return null;

    const field = this.adminProfileFields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages || {};

    if (control?.hasError('server')) {
      return this.serverErrors[fieldName] || platformMessages.errorMessage;
    }

    return this.validationErrorService.getErrorMessage(control, messages, fieldName);
  }
  //#endregion

  profileUpload(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file: File = input.files[0];

      if (!allowedImageTypes.includes(file.type)) {
        this.snackbar.showError(platformMessages.invalidImageType);
        return;
      }

      const formData = new FormData();
      formData.append('ProfilePic', file);

      this.userProfileService
        .updateProfilePic(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.result) {
              const reader = new FileReader();
              reader.onload = (e: ProgressEvent<FileReader>) => {
                const result = e.target?.result;
                if (result) {
                  this.profilePicUrl = result as string;
                }
              };
              reader.readAsDataURL(file);

              this.loadAdminProfile();
              this.snackbar.showSuccess(
                platformMessages.successTitle,
                platformMessages.uploadSuccess,
              );
            }
          },
          error: () => {
            this.snackbar.showError(platformMessages.errorTitle, platformMessages.uploadFailed);
          },
        });
    }
  }

  //#region Email Available
  validateEmail(): void {
    const control = this.adminProfileForm.get('email');
    const value = control?.value?.trim();

    if (!value || control?.invalid) return;

    this.userProfileService
      .checkEmailAvailable(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.serverErrors['email'] = '';
          if (control?.hasError('server')) {
            control.setErrors({ ...control.errors, server: null });
            control.updateValueAndValidity({ onlySelf: true });
          }
        },
        error: (err) => {
          const status = err.status;
          const message = err?.error?.message || platformMessages.errorMessage;
          if (status >= 400 && status < 500) {
            this.serverErrors['email'] = message;
            control?.setErrors({ ...control.errors, server: true });
          } else {
            this.snackbar.showError(`${platformMessages.errorTitle}`, message);
          }
        },
      });
    this.listenToEmailChanges();
  }
  //#endregion

  //#region Verify OTP
  verifyOtp() {
    const otp = this.adminProfileForm.get('otp')?.value;
    if (!otp) {
      this.adminProfileForm.get('otp')?.markAsTouched();
      return;
    }

    this.userProfileService
      .verifyOtp({ otp })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackbar.showSuccess(platformMessages.otpVerifySuccess);
          this.otpVerified.set(true);
          this.verifiedEmail.set(this.adminProfileForm.get('email')?.value?.trim());
          this.otpSent.set(false);
          this.updateOtpButtonConfig();
        },
        error: () => {
          this.snackbar.showError(platformMessages.errorTitle, platformMessages.otpVerifyFailed);
        },
      });
  }
  //#endregion

  //#region OTP
  sendOrResendOtp() {
    const email = this.adminProfileForm.get('email')?.value?.trim();
    if (!email || this.adminProfileForm.get('email')?.invalid) {
      this.adminProfileForm.get('email')?.markAsTouched();
      return;
    }

    const isAlreadyVerified = email === this.backendEmail() || email === this.verifiedEmail();

    if (isAlreadyVerified) {
      this.snackbar.showInfo(platformMessages.emailAlreadyVerified);
      this.otpSent.set(false);
      this.otpVerified.set(true);
      return;
    }

    const attempts = this.emailOtpAttempts.get(email) || 0;
    if (attempts >= this.maxOtpAttempts) {
      this.snackbar.showWarning(platformMessages.otpLimitReached);
      return;
    }

    this.userProfileService
      .sendOtp({ email })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackbar.showSuccess(platformMessages.otpSendSuccess);
          this.otpSent.set(true);
          this.otpVerified.set(false);
          this.emailOtpAttempts.set(email, attempts + 1);
          this.startCountdown(10);
        },
        error: () => {
          this.snackbar.showError(platformMessages.errorTitle, platformMessages.otpSendFailed);
        },
      });
  }

  isOtpLimitReached(): boolean {
    const email = this.adminProfileForm.get('email')?.value?.trim();
    if (!email) return false;
    return (this.emailOtpAttempts.get(email) || 0) >= this.maxOtpAttempts;
  }
  //#endregion

  //#region CountDown
  startCountdown(seconds: number): void {
    this.countdown.set(seconds);
    this.countdownSub?.unsubscribe();

    this.countdownSub = interval(1000)
      .pipe(take(seconds))
      .subscribe({
        next: (count) => {
          this.countdown.set(seconds - count - 1);
        },
        complete: () => {
          this.countdown.set(0);
          this.updateOtpButtonConfig();
        },
      });
  }

  stopCountdown(): void {
    this.countdownSub?.unsubscribe();
    this.countdown.set(0);
  }
  //#endregion

  //#region ButtonConfig
  updateOtpButtonConfig(): void {
    const email = this.adminProfileForm.get('email')?.value?.trim() ?? '';
    const attempts = this.emailOtpAttempts.get(email) || 0;

    const isDisabled =
      !email || this.adminProfileForm.get('email')?.invalid || attempts >= this.maxOtpAttempts;

    const isEmailVerified =
      email && (email === this.backendEmail() || email === this.verifiedEmail());
    let baseConfig: ButtonConfig;

    if (isEmailVerified) {
      baseConfig = { ...this.sendOtpBtn };
      this.otpSent.set(false);
    } else if (this.otpSent()) {
      baseConfig = this.resendOtpBtn;
    } else {
      baseConfig = this.sendOtpBtn;
    }

    this.otpButtonConfig.set({
      ...baseConfig,
      isDisabled,
    });
  }
  //#endregion

  //#region Submit
  onSubmit() {
    const email = this.adminProfileForm.get('email')?.value?.trim();
    const isEmailChanged = email !== this.backendEmail();
    const canSave = !isEmailChanged || (email === this.verifiedEmail() && this.otpVerified());

    if (this.adminProfileForm.invalid) {
      this.adminProfileForm.markAllAsTouched();
      return;
    }

    if (!canSave) {
      this.snackbar.showError(platformMessages.verifyEmailBeforeSave);
      return;
    }

    if (this.adminProfileForm.valid) {
      const formValue = this.adminProfileForm.value;

      const payload: AdminProfileUpdatedData = {
        fullName: formValue.fullName,
        userName: formValue.username,
        email: formValue.email,
        bio: formValue.bio,
      };
      this.userProfileService
        .updateAdminProfile(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.result) {
              this.snackbar.showSuccess(platformMessages.successTitle, res.message);

              this.headerFullName = this.adminProfileForm.get('fullName')?.value;
              this.headerEmail = this.adminProfileForm.get('email')?.value;

              this.otpSent.set(false);
              this.otpVerified.set(true);
              this.emailOtpAttempts.clear();
              this.stopCountdown();

              this.backendEmail.set(email);
              this.verifiedEmail.set(email);
              this.lastTypedEmail = email;
              this.adminProfileForm.get('otp')?.reset();
              this.updateOtpButtonConfig();
            } else {
              this.snackbar.showError(platformMessages.errorTitle, res.message);
            }
          },
          error: (err) => {
            this.snackbar.showError(
              platformMessages.errorTitle,
              err?.error?.message || platformMessages.errorMessage,
            );
          },
        });
    } else {
      this.adminProfileForm.markAllAsTouched();
    }
  }
  //#endregion

  //#region Cancel Changes
  cancelChanges(): void {
    this.loadAdminProfile();
    this.otpSent.set(false);
    this.otpVerified.set(false);
    this.countdown.set(0);
    this.countdownSub?.unsubscribe();
    this.emailOtpAttempts.clear();
    this.updateOtpButtonConfig();
  }
  //#endregion

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#region load admin profile
  private loadAdminProfile() {
    this.userProfileService
      .getAdminProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          if (!profile.result || !profile.data) return;
          const admin: AdminUserProfileFormData = profile.data;

          this.adminProfileForm.patchValue({
            fullName: admin.fullName,
            username: admin.userName,
            email: admin.email,
            bio: admin.bio || '',
          });

          // Update header separately
          this.headerFullName = admin.fullName;
          this.headerEmail = admin.email;

          this.profilePicUrl = admin.profilePic
            ? `${environment.imageBaseUrl}/${admin.profilePic}`
            : defaultProfilePic;
          this.backendEmail.set(admin.email);
          this.verifiedEmail.set(admin.email);
          this.otpVerified.set(true);
          this.lastTypedEmail = admin.email;
          this.listenToEmailChanges();
        },
        error: (err) => {
          this.snackbar.showError(
            `${platformMessages.errorTitle}`,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }

  profileImageError() {
    this.profilePicUrl = defaultProfilePic;
    this.isImageError = true;
  }
  //#endregion

  //#region listenToEmailChanges
  private listenToEmailChanges(): void {
    this.adminProfileForm
      .get('email')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value: string) => {
        const trimmed = value?.trim() ?? '';
        if (trimmed === this.lastTypedEmail) return;

        this.lastTypedEmail = trimmed;

        this.stopCountdown();

        if (trimmed && !this.emailOtpAttempts.has(trimmed)) {
          this.emailOtpAttempts.set(trimmed, 0);
        }

        this.updateOtpButtonConfig();

        if (trimmed && trimmed !== this.backendEmail() && !this.otpVerified()) {
          this.adminProfileForm.get('otp')?.setValidators([Validators.required]);
        } else {
          this.adminProfileForm.get('otp')?.clearValidators();
        }
        this.adminProfileForm.get('otp')?.updateValueAndValidity({ emitEvent: false });
        this.adminProfileForm.get('otp')?.markAsPristine();
        this.adminProfileForm.get('otp')?.markAsUntouched();
      });
  }
  //#endregion
}
