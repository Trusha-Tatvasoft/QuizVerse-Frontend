import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { UserProfileService } from '../../../../../services/user/user-profile/user-profile.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { UserProfileSettingComponent } from './user-profile-setting.component';

describe('ProfileSettingComponent (Jest)', () => {
  let component: UserProfileSettingComponent;
  let fixture: ComponentFixture<UserProfileSettingComponent>;

  const mockUserProfileService = {
    getUserProfileSetting: jest.fn().mockReturnValue(
      of({
        result: true,
        data: {
          email: 'test@test.com',
          fullName: 'Test User',
          bio: 'test bio',
        },
      }),
    ),
    checkEmailAvailable: jest.fn(),
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
    updateUserProfile: jest.fn(),
  };

  const mockSnackbar = {
    showError: jest.fn(),
    showSuccess: jest.fn(),
    showInfo: jest.fn(),
    showWarning: jest.fn(),
  };

  const mockValidation = {
    getErrorMessage: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UserProfileSettingComponent],
      providers: [
        FormBuilder,
        { provide: UserProfileService, useValue: mockUserProfileService },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: ValidationErrorService, useValue: mockValidation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileSettingComponent);
    component = fixture.componentInstance;

    component.buildForm({
      email: 'init@test.com',
      fullName: 'Init User',
      bio: 'init bio',
    });

    jest.clearAllMocks();
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should create and load user profile', () => {
    mockUserProfileService.getUserProfileSetting.mockReturnValue(
      of({ result: true, data: { fullName: 'Test', email: 't@test.com', bio: 'bio' } }),
    );

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.form.get('email')?.value).toBe('t@test.com');
    expect(component.backendEmail()).toBe('t@test.com');
    expect(component.otpVerified()).toBe(true);
  });

  it('should show error when loadUserProfile fails', () => {
    mockUserProfileService.getUserProfileSetting.mockReturnValue(
      throwError(() => new Error('fail')),
    );

    component.ngOnInit();
    fixture.detectChanges();

    expect(mockSnackbar.showError).toHaveBeenCalledWith('Failed to load user profile');
  });

  it('should handle email changes correctly', () => {
    mockUserProfileService.getUserProfileSetting.mockReturnValue(
      of({ result: true, data: { email: 'old@test.com' } }),
    );

    component.ngOnInit();
    fixture.detectChanges();

    const emailControl = component.form.get('email');
    emailControl?.setValue('new@test.com');
    fixture.detectChanges();

    expect(component.otpVerified()).toBe(true);
    expect(emailControl?.hasValidator).toBeDefined();
  });

  describe('validateEmail', () => {
    it('should clear server errors on success', () => {
      mockUserProfileService.checkEmailAvailable.mockReturnValue(of({}));
      component.form.get('email')?.setValue('valid@test.com');

      component.validateEmail();

      expect(component.serverErrors['email']).toBe('');
    });

    it('should set server error for 400 error', () => {
      mockUserProfileService.checkEmailAvailable.mockReturnValue(
        throwError(() => ({ status: 400, error: { message: 'Taken' } })),
      );
      component.form.get('email')?.setValue('bad@test.com');

      component.validateEmail();

      expect(component.serverErrors['email']).toBe('Taken');
    });

    it('should call snackbar for server error >=500', () => {
      mockUserProfileService.checkEmailAvailable.mockReturnValue(
        throwError(() => ({ status: 500 })),
      );
      component.form.get('email')?.setValue('bad@test.com');

      component.validateEmail();

      expect(mockSnackbar.showError).toHaveBeenCalled();
    });
  });

  describe('sendOrResendOtp', () => {
    it('should not send if email invalid', () => {
      component.form.get('email')?.setValue('');
      component.sendOrResendOtp();
      expect(mockUserProfileService.sendOtp).not.toHaveBeenCalled();
    });

    it('should show info if already verified', () => {
      component.backendEmail.set('same@test.com');
      component.form.get('email')?.setValue('same@test.com');

      component.sendOrResendOtp();

      expect(mockSnackbar.showInfo).toHaveBeenCalledWith('Email already verified.');
      expect(component.otpVerified()).toBe(true);
    });

    it('should warn if attempts exceeded', () => {
      component.form.get('email')?.setValue('limit@test.com');
      component.emailOtpAttemptsMap.set('limit@test.com', 2);

      component.sendOrResendOtp();

      expect(mockSnackbar.showWarning).toHaveBeenCalledWith(
        'OTP send limit reached for this email.',
      );
    });

    it('should send otp successfully', () => {
      component.form.get('email')?.setValue('new@test.com');
      mockUserProfileService.sendOtp.mockReturnValue(of({}));

      component.sendOrResendOtp();

      expect(mockUserProfileService.sendOtp).toHaveBeenCalled();
      expect(mockSnackbar.showSuccess).toHaveBeenCalledWith('OTP sent successfully.');
      expect(component.otpSent()).toBe(true);
    });

    it('should show error on sendOtp failure', () => {
      component.form.get('email')?.setValue('fail@test.com');
      mockUserProfileService.sendOtp.mockReturnValue(throwError(() => new Error('fail')));

      component.sendOrResendOtp();

      expect(mockSnackbar.showError).toHaveBeenCalledWith('Failed to send OTP.');
    });
  });

  describe('verifyOtp', () => {
    it('should not verify if otp invalid', () => {
      component.form.get('otp')?.setValue('');
      component.verifyOtp();
      expect(mockUserProfileService.verifyOtp).not.toHaveBeenCalled();
    });

    it('should verify successfully', () => {
      component.form.get('otp')?.setValue('123456');
      component.form.get('email')?.setValue('verify@test.com');
      mockUserProfileService.verifyOtp.mockReturnValue(of({ result: true }));

      component.verifyOtp();

      expect(mockUserProfileService.verifyOtp).toHaveBeenCalledWith({ otp: '123456' });
      expect(mockSnackbar.showSuccess).toHaveBeenCalledWith('OTP verified successfully.');
      expect(component.otpVerified()).toBe(true);
      expect(component.verifiedEmail()).toBe('verify@test.com');
    });

    it('should show error on failure', () => {
      component.form.get('otp')?.setValue('123456');
      mockUserProfileService.verifyOtp.mockReturnValue(throwError(() => new Error('fail')));

      component.verifyOtp();

      expect(mockSnackbar.showError).toHaveBeenCalledWith('OTP verification failed.');
    });
  });

  describe('updateOtpButtonConfig', () => {
    it('should disable when invalid', () => {
      component.form.get('email')?.setValue('');
      component.updateOtpButtonConfig();
      expect(component.otpButtonConfig().isDisabled).toBe(true);
    });

    it('should show resend when otpSent true', () => {
      component.form.get('email')?.setValue('new@test.com');
      component.otpSent.set(true);

      component.updateOtpButtonConfig();
      expect(component.otpButtonConfig().label).toBe(component.resendOtpBtn.label);
    });

    it('should show send when verified', () => {
      component.backendEmail.set('same@test.com');
      component.form.get('email')?.setValue('same@test.com');

      component.updateOtpButtonConfig();
      expect(component.otpButtonConfig().label).toBe(component.sendOtpBtn.label);
    });
  });

  describe('saveChanges', () => {
    it('should block if email not verified', () => {
      component.form.get('email')?.setValue('new@test.com');
      component.backendEmail.set('old@test.com');
      component.otpVerified.set(false);

      component.saveChanges();

      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        'Please verify your new email before saving.',
      );
    });

    it('should not save if form invalid', () => {
      component.form.get('email')?.setValue('');
      component.backendEmail.set('');
      component.verifiedEmail.set('');
      component.otpVerified.set(true);

      component.saveChanges();

      expect(mockUserProfileService.updateUserProfile).not.toHaveBeenCalled();
    });

    it('should save successfully', fakeAsync(() => {
      component.form.get('email')?.setValue('save@test.com');
      component.form.get('fullName')?.setValue('Valid Name');
      component.form.get('bio')?.setValue('valid bio');
      component.form.markAsDirty();

      component.backendEmail.set('save@test.com');
      component.verifiedEmail.set('save@test.com');
      component.otpVerified.set(true);

      mockUserProfileService.updateUserProfile.mockReturnValue(of({ result: true }));

      component.saveChanges();
      tick();

      expect(mockUserProfileService.updateUserProfile).toHaveBeenCalled();
      expect(mockSnackbar.showSuccess).toHaveBeenCalledWith('Profile updated successfully.');
    }));

    it('should show error if backend returns false', () => {
      component.form.patchValue({
        email: 'fail@test.com',
        fullName: 'Some User',
        bio: 'some bio',
      });
      component.backendEmail.set('fail@test.com');
      component.verifiedEmail.set('fail@test.com');
      component.otpVerified.set(true);

      mockUserProfileService.updateUserProfile.mockReturnValue(of({ result: false }));

      component.saveChanges();

      expect(mockSnackbar.showError).toHaveBeenCalledWith('Update failed.', undefined);
    });

    it('should show error if update fails', () => {
      component.form.patchValue({
        email: 'fail@test.com',
        fullName: 'Some User',
        bio: 'some bio',
      });
      component.backendEmail.set('fail@test.com');
      component.verifiedEmail.set('fail@test.com');
      component.otpVerified.set(true);

      mockUserProfileService.updateUserProfile.mockReturnValue(throwError(() => new Error('fail')));

      component.saveChanges();

      expect(mockSnackbar.showError).toHaveBeenCalledWith('Update failed.');
    });
  });

  it('should cancel changes', () => {
    component.otpSent.set(true);
    component.otpVerified.set(true);

    component.cancelChanges();

    expect(component.otpSent()).toBe(false);
    expect(component.otpVerified()).toBe(false);
    expect(component.countdown()).toBe(0);
  });

  describe('getError', () => {
    it('should return server error', () => {
      component.serverErrors['email'] = 'Server bad';
      component.form.get('email')?.setErrors({ server: true });

      const msg = component.getError('email');
      expect(msg).toBe('Server bad');
    });

    it('should fallback to validationErrorService', () => {
      component.serverErrors['email'] = '';
      mockValidation.getErrorMessage.mockReturnValue('Validation fail');
      const msg = component.getError('email');
      expect(msg).toBe('Validation fail');
    });
  });

  it('should check otp limit reached', () => {
    component.form.get('email')?.setValue('x@test.com');
    component.emailOtpAttemptsMap.set('x@test.com', 2);

    expect(component.isOtpLimitReached()).toBe(true);
  });
});
