import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { DynamicFormField } from '../../../../../shared/interfaces/dynamic-form-field.interface';
import {
  cancelButtonConfig,
  profileFormFields,
  resendOtpButtonConfig,
  sendOtpButtonConfig,
  submitButtonConfig,
  verifyOtpButtonConfig,
} from '../../configs/profile-setting.config';
import { CommonModule } from '@angular/common';
import { interval, Subject, Subscription, take, takeUntil } from 'rxjs';
import { UserProfileService } from '../../../../../services/user/user-profile/user-profile.service';
import { maxOtpAttempts, platformMessages } from '../../../../../utils/constants';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { ButtonConfig } from '../../../../../shared/interfaces/button-config.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserProfileSetting } from '../../interfaces/user-profile-setting.interface';

type ProfileFormFieldNames = (typeof profileFormFields)[number]['name'];
type ProfileFormErrors = Partial<Record<ProfileFormFieldNames, string>>;

@Component({
  selector: 'app-profile-setting',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    OutlineButtonComponent,
    FilledButtonComponent,
    CommonModule,
    MatTooltipModule,
  ],
  templateUrl: './user-profile-setting.component.html',
  styleUrl: './user-profile-setting.component.scss',
})
export class UserProfileSettingComponent implements OnInit, OnDestroy {
  submitBtn = submitButtonConfig;
  cancelBtn = cancelButtonConfig;
  verifyOtpBtn = verifyOtpButtonConfig;
  sendOtpBtn = sendOtpButtonConfig;
  resendOtpBtn = resendOtpButtonConfig;

  serverErrors: ProfileFormErrors = {};
  countdownSub?: Subscription;
  emailOtpAttemptsMap = new Map<string, number>();
  maxOtpAttempts = maxOtpAttempts;
  lastTypedEmail = '';
  form!: FormGroup;
  fields: DynamicFormField[] = profileFormFields;

  backendEmail = signal<string>('');
  verifiedEmail = signal<string | null>(null);
  otpSent = signal(false);
  otpVerified = signal(false);
  countdown = signal(0);
  otpButtonConfig = signal<ButtonConfig>(sendOtpButtonConfig);

  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly snackbar = inject(SnackbarService);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.buildForm();
    this.loadUserProfile();
  }

  //#region Load user profile
  loadUserProfile(): void {
    this.userProfileService
      .getUserProfileSetting()
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.buildForm(response.data);
          this.listenToEmailChanges();
        },
        error: () => {
          this.snackbar.showError(platformMessages.loadProfileFailed);
        },
      });
  }

  //#endregion

  //#region build form
  buildForm(data?: UserProfileSetting): void {
    if (this.form) {
      this.form.reset();
    } else {
      this.form = this.fb.group({});
      this.fields.forEach((field) => {
        this.form.addControl(field.name, this.fb.control('', field.validators as ValidatorFn[]));
      });
    }

    if (data) {
      this.form.reset({
        fullName: data.fullName ?? '',
        email: data.email,
        bio: data.bio ?? '',
      });

      this.backendEmail.set(data.email);
      this.verifiedEmail.set(data.email);
      this.otpVerified.set(true);
      this.lastTypedEmail = data.email;
    }
  }

  getError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control) return null;

    const field = this.fields.find((f) => f.name === fieldName);
    const messages = field?.validationMessages ?? {};

    if (control?.hasError('server')) {
      return this.serverErrors[fieldName] || platformMessages.errorMessage;
    }

    return this.validationErrorService.getErrorMessage(control, messages, fieldName);
  }
  //#endregion

  //#region listenToEmailChanges
  listenToEmailChanges(): void {
    this.form
      .get('email')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value: string) => {
        const trimmed = value?.trim();
        if (trimmed !== this.lastTypedEmail) {
          this.lastTypedEmail = trimmed;

          this.stopCountdown();

          if (trimmed && !this.emailOtpAttemptsMap.has(trimmed)) {
            this.emailOtpAttemptsMap.set(trimmed, 0);
          }
          this.updateOtpButtonConfig();

          if (trimmed && trimmed !== this.backendEmail() && !this.otpVerified()) {
            this.form.get('otp')?.setValidators([Validators.required]);
          } else {
            this.form.get('otp')?.clearValidators();
          }
          this.form.get('otp')?.updateValueAndValidity({ emitEvent: false });
          this.form.get('otp')?.markAsPristine();
          this.form.get('otp')?.markAsUntouched();
        }
      });
  }
  //#endregion

  //#region Email Available
  validateEmail(): void {
    const control = this.form.get('email');
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
            control?.setErrors({ server: true });
          } else {
            this.snackbar.showError(`${platformMessages.errorTitle} ${status}`, message);
          }
        },
      });
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

  //#region OTP
  sendOrResendOtp(): void {
    const email = this.form.get('email')?.value?.trim();
    if (!email || this.form.get('email')?.invalid) {
      this.form.get('email')?.markAsTouched();
      return;
    }

    const isAlreadyVerified = email === this.backendEmail() || email === this.verifiedEmail();

    if (isAlreadyVerified) {
      this.snackbar.showInfo(platformMessages.emailAlreadyVerified);
      this.otpSent.set(false);
      this.otpVerified.set(true);
      return;
    }

    const attempts = this.emailOtpAttemptsMap.get(email) || 0;
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
          this.emailOtpAttemptsMap.set(email, attempts + 1);
          this.startCountdown(10);
        },
        error: () => {
          this.snackbar.showError(platformMessages.otpSendFailed);
        },
      });
  }

  verifyOtp(): void {
    const otp = this.form.get('otp')?.value;
    if (!otp || this.form.get('otp')?.invalid) {
      this.form.get('otp')?.markAsTouched();
      return;
    }

    this.userProfileService
      .verifyOtp({ otp })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackbar.showSuccess(platformMessages.otpVerifySuccess);
          this.otpVerified.set(true);
          this.verifiedEmail.set(this.form.get('email')?.value);
        },
        error: () => {
          this.snackbar.showError(platformMessages.otpVerifyFailed);
        },
      });
  }

  isOtpLimitReached(): boolean {
    const email = this.form.get('email')?.value?.trim();
    const attempts = this.emailOtpAttemptsMap.get(email) || 0;
    return attempts >= this.maxOtpAttempts;
  }
  //#endregion

  //#region ButtonConfig
  updateOtpButtonConfig(): void {
    const email = this.form.get('email')?.value?.trim();
    const attempts = this.emailOtpAttemptsMap.get(email) || 0;

    const isDisabled = !email || this.form.get('email')?.invalid || attempts >= this.maxOtpAttempts;

    const isEmailVerified = email === this.backendEmail() || email === this.verifiedEmail();

    const baseConfig = isEmailVerified
      ? this.sendOtpBtn
      : this.otpSent()
        ? this.resendOtpBtn
        : this.sendOtpBtn;

    this.otpButtonConfig.set({
      ...baseConfig,
      isDisabled,
    });
  }
  //#endregion

  //#region saveChanges
  saveChanges(): void {
    const email = this.form.get('email')?.value?.trim();
    const fullName = this.form.get('fullName')?.value?.trim();
    const bio = this.form.get('bio')?.value?.trim() || '';
    const isEmailChanged = email !== this.backendEmail();

    const canSave = !isEmailChanged || (email === this.verifiedEmail() && this.otpVerified());

    if (!canSave) {
      this.snackbar.showError(platformMessages.verifyEmailBeforeSave);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: UserProfileSetting = { fullName, email, bio };

    this.userProfileService
      .updateUserProfile(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result) {
            this.snackbar.showSuccess(platformMessages.profileUpdateSuccess);

            // Reset all OTP state to initial values.
            this.otpSent.set(false);
            this.otpVerified.set(true);
            this.emailOtpAttemptsMap.clear();
            this.stopCountdown();

            const newEmail = this.form.get('email')?.value?.trim();
            this.backendEmail.set(newEmail);
            this.verifiedEmail.set(newEmail);
            this.lastTypedEmail = newEmail;
            this.form.get('otp')?.reset();

            this.updateOtpButtonConfig();
          } else {
            this.snackbar.showError(platformMessages.profileUpdateFailed, res.message);
          }
        },
        error: () => {
          this.snackbar.showError(platformMessages.profileUpdateFailed);
        },
      });
  }

  cancelChanges(): void {
    this.loadUserProfile();
    this.otpSent.set(false);
    this.otpVerified.set(false);
    this.countdown.set(0);
    this.countdownSub?.unsubscribe();
    this.emailOtpAttemptsMap.clear();
    this.updateOtpButtonConfig();
  }
  //#endregion

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
