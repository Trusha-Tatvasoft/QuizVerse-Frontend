import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AdminProfileComponent } from './admin-profile.component';
import { UserProfileService } from '../../../services/user/user-profile/user-profile.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../shared/service/validation-error/validation-error.service';
import { platformMessages, defaultProfilePic } from '../../../utils/constants';

describe('AdminProfileComponent (Jest)', () => {
  let component: AdminProfileComponent;
  let fixture: ComponentFixture<AdminProfileComponent>;

  const mockUserProfileService = {
    getAdminProfile: jest.fn(),
    updateAdminProfile: jest.fn(),
    updateProfilePic: jest.fn(),
    checkEmailAvailable: jest.fn(),
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
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
      imports: [ReactiveFormsModule, AdminProfileComponent],
      providers: [
        FormBuilder,
        { provide: UserProfileService, useValue: mockUserProfileService },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: ValidationErrorService, useValue: mockValidation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProfileComponent);
    component = fixture.componentInstance;
    jest.clearAllMocks();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should build form and load profile', () => {
      mockUserProfileService.getAdminProfile.mockReturnValue(
        of({
          result: true,
          data: {
            fullName: 'Admin',
            email: 'admin@test.com',
            userName: 'adm',
            bio: '',
            profilePic: '',
          },
        }),
      );

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.adminProfileForm.get('email')?.value).toBe('admin@test.com');
      expect(component.headerFullName).toBe('Admin');
      expect(component.otpVerified()).toBe(true);
    });
  });

  describe('getError', () => {
    it('should return server error', () => {
      component.serverErrors['email'] = 'Taken';
      component.adminProfileForm = new FormBuilder().group({ email: [''] });
      component.adminProfileForm.get('email')?.setErrors({ server: true });

      const result = component.getError('email');
      expect(result).toBe('Taken');
    });

    it('should fallback to validation service', () => {
      component.serverErrors['email'] = '';
      mockValidation.getErrorMessage.mockReturnValue('Validation fail');
      component.adminProfileForm = new FormBuilder().group({ email: [''] });

      const result = component.getError('email');
      expect(result).toBe('Validation fail');
    });
  });

  describe('profileUpload', () => {
    it('should reject invalid file type', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const event = { target: { files: [file] } } as unknown as Event;

      component.profileUpload(event);

      expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.invalidImageType);
    });

    it('should upload valid image and update profile pic', fakeAsync(() => {
      component.buildForm();
      const file = new File(['123'], 'pic.png', { type: 'image/png' });
      const event = { target: { files: [file] } } as unknown as Event;

      mockUserProfileService.updateProfilePic.mockReturnValue(of({ result: true }));
      mockUserProfileService.getAdminProfile.mockReturnValue(
        of({ result: true, data: { fullName: 'Admin', email: 'a@test.com', userName: 'adm' } }),
      );

      // Mock FileReader
      const readerMock = {
        onload: null as ((ev: ProgressEvent<FileReader>) => void) | null,
        readAsDataURL: jest.fn(function (this: any) {
          if (this.onload) {
            this.onload({ target: { result: 'assets/images/profile.png' } } as any);
          }
        }),
      } as unknown as FileReader;
      jest.spyOn(window as any, 'FileReader').mockImplementation(() => readerMock);

      component.profileUpload(event);
      tick();

      expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        platformMessages.uploadSuccess,
      );
      expect(mockUserProfileService.updateProfilePic).toHaveBeenCalled();
      expect(component.profilePicUrl).toBe('assets/images/profile.png');
    }));

    it('should handle upload error', () => {
      const file = new File(['123'], 'pic.png', { type: 'image/png' });
      const event = { target: { files: [file] } } as unknown as Event;

      mockUserProfileService.updateProfilePic.mockReturnValue(throwError(() => new Error('fail')));

      component.profileUpload(event);

      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.uploadFailed,
      );
    });

    it('should not do anything if no file is selected', () => {
      const emptyEvent = { target: { files: [] } } as unknown as Event;

      component.profileUpload(emptyEvent);

      expect(mockUserProfileService.updateProfilePic).not.toHaveBeenCalled();
      expect(mockSnackbar.showError).not.toHaveBeenCalled();
      expect(mockSnackbar.showSuccess).not.toHaveBeenCalled();
    });

    it('should not do anything if files is null', () => {
      const nullFilesEvent = { target: { files: null } } as unknown as Event;

      component.profileUpload(nullFilesEvent);

      expect(mockUserProfileService.updateProfilePic).not.toHaveBeenCalled();
    });
  });

  describe('validateEmail', () => {
    beforeEach(() => {
      component.adminProfileForm = new FormBuilder().group({ email: ['valid@test.com'] });
    });

    it('should clear server errors', () => {
      mockUserProfileService.checkEmailAvailable.mockReturnValue(of({}));
      component.validateEmail();
      expect(component.serverErrors['email']).toBe('');
    });

    it('should set error for 400 error', () => {
      mockUserProfileService.checkEmailAvailable.mockReturnValue(
        throwError(() => ({ status: 400, error: { message: 'Taken' } })),
      );
      component.validateEmail();
      expect(component.serverErrors['email']).toBe('Taken');
    });

    it('should show snackbar for 500 error', () => {
      mockUserProfileService.checkEmailAvailable.mockReturnValue(
        throwError(() => ({ status: 500 })),
      );
      component.validateEmail();
      expect(mockSnackbar.showError).toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    beforeEach(() => {
      component.adminProfileForm = new FormBuilder().group({ email: ['e@test.com'], otp: [''] });
    });

    it('should not verify if otp empty', () => {
      component.verifyOtp();
      expect(mockUserProfileService.verifyOtp).not.toHaveBeenCalled();
    });

    it('should verify successfully', () => {
      component.adminProfileForm.get('otp')?.setValue('123456');
      mockUserProfileService.verifyOtp.mockReturnValue(of({}));

      component.verifyOtp();

      expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(platformMessages.otpVerifySuccess);
      expect(component.otpVerified()).toBe(true);
    });

    it('should show error if verify fails', () => {
      component.adminProfileForm.get('otp')?.setValue('123456');
      mockUserProfileService.verifyOtp.mockReturnValue(throwError(() => new Error('fail')));

      component.verifyOtp();

      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.otpVerifyFailed,
      );
    });
  });

  describe('sendOrResendOtp', () => {
    beforeEach(() => {
      component.adminProfileForm = new FormBuilder().group({ email: ['test@test.com'] });
    });

    it('should block if email invalid', () => {
      component.adminProfileForm.get('email')?.setValue('');
      component.sendOrResendOtp();
      expect(mockUserProfileService.sendOtp).not.toHaveBeenCalled();
    });

    it('should show info if already verified', () => {
      component.backendEmail.set('same@test.com');
      component.adminProfileForm.get('email')?.setValue('same@test.com');
      component.sendOrResendOtp();
      expect(mockSnackbar.showInfo).toHaveBeenCalledWith(platformMessages.emailAlreadyVerified);
    });

    it('should warn if attempts exceeded', () => {
      component.emailOtpAttempts.set('limit@test.com', component.maxOtpAttempts);
      component.adminProfileForm.get('email')?.setValue('limit@test.com');
      component.sendOrResendOtp();
      expect(mockSnackbar.showWarning).toHaveBeenCalledWith(platformMessages.otpLimitReached);
    });

    it('should send otp successfully', () => {
      mockUserProfileService.sendOtp.mockReturnValue(of({}));
      component.sendOrResendOtp();
      expect(mockUserProfileService.sendOtp).toHaveBeenCalled();
      expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(platformMessages.otpSendSuccess);
    });

    it('should show error if sendOtp fails', () => {
      mockUserProfileService.sendOtp.mockReturnValue(throwError(() => new Error('fail')));
      component.sendOrResendOtp();
      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.otpSendFailed,
      );
    });
  });

  describe('isOtpLimitReached', () => {
    it('should return false when email is empty', () => {
      component.buildForm();
      component.adminProfileForm.get('email')?.setValue('');
      expect(component.isOtpLimitReached()).toBe(false);
    });

    it('should return true when limit is reached', () => {
      component.buildForm();
      component.adminProfileForm.get('email')?.setValue('test@test.com');
      component.emailOtpAttempts.set('test@test.com', component.maxOtpAttempts);
      expect(component.isOtpLimitReached()).toBe(true);
    });

    it('should return false when under limit', () => {
      component.buildForm();
      component.adminProfileForm.get('email')?.setValue('test@test.com');
      component.emailOtpAttempts.set('test@test.com', 1);
      expect(component.isOtpLimitReached()).toBe(false);
    });
  });

  describe('updateOtpButtonConfig', () => {
    beforeEach(() => {
      component.adminProfileForm = new FormBuilder().group({ email: ['x@test.com'] });
    });

    it('should disable when invalid', () => {
      component.adminProfileForm.get('email')?.setValue('');
      component.updateOtpButtonConfig();
      expect(component.otpButtonConfig().isDisabled).toBe(true);
    });

    it('should show resend when otpSent true', () => {
      component.otpSent.set(true);
      component.updateOtpButtonConfig();
      expect(component.otpButtonConfig().label).toBe(component.resendOtpBtn.label);
    });

    it('should show send when email verified', () => {
      component.backendEmail.set('x@test.com');
      component.updateOtpButtonConfig();
      expect(component.otpButtonConfig().label).toBe(component.sendOtpBtn.label);
    });
  });

  describe('countdown', () => {
    it('should start and stop countdown', fakeAsync(() => {
      component.buildForm();
      component.startCountdown(2);
      tick(2000);
      expect(component.countdown()).toBe(0);
      component.stopCountdown();
      expect(component.countdown()).toBe(0);
    }));
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.adminProfileForm = new FormBuilder().group({
        email: ['test@test.com'],
        fullName: ['Admin'],
        username: ['adm'],
        bio: [''],
        otp: [''],
      });
    });

    it('should not submit if form invalid', () => {
      component.buildForm();
      component.adminProfileForm.get('email')?.setValue('');
      component.onSubmit();
      expect(mockUserProfileService.updateAdminProfile).not.toHaveBeenCalled();
    });

    it('should block if email not verified', () => {
      component.backendEmail.set('old@test.com');
      component.otpVerified.set(false);
      component.onSubmit();
      expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.verifyEmailBeforeSave);
    });

    it('should submit successfully', fakeAsync(() => {
      component.backendEmail.set('test@test.com');
      component.verifiedEmail.set('test@test.com');
      component.otpVerified.set(true);
      mockUserProfileService.updateAdminProfile.mockReturnValue(
        of({ result: true, message: 'ok' }),
      );

      component.onSubmit();
      tick();

      expect(mockUserProfileService.updateAdminProfile).toHaveBeenCalled();
      expect(mockSnackbar.showSuccess).toHaveBeenCalled();
    }));

    it('should show error if backend result false', () => {
      component.backendEmail.set('test@test.com');
      component.verifiedEmail.set('test@test.com');
      component.otpVerified.set(true);
      mockUserProfileService.updateAdminProfile.mockReturnValue(
        of({ result: false, message: 'fail' }),
      );

      component.onSubmit();

      expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'fail');
    });

    it('should show error if update fails', () => {
      component.backendEmail.set('test@test.com');
      component.verifiedEmail.set('test@test.com');
      component.otpVerified.set(true);
      mockUserProfileService.updateAdminProfile.mockReturnValue(
        throwError(() => new Error('fail')),
      );

      component.onSubmit();

      expect(mockSnackbar.showError).toHaveBeenCalled();
    });
  });

  describe('cancelChanges', () => {
    it('should reset OTP state and reload profile', () => {
      component.buildForm();
      component.otpSent.set(true);
      component.otpVerified.set(true);
      component.countdown.set(30);

      mockUserProfileService.getAdminProfile.mockReturnValue(
        of({
          result: true,
          data: {
            fullName: 'Admin',
            email: 'admin@test.com',
            userName: 'adm',
            bio: '',
            profilePic: '',
          },
        }),
      );

      component.cancelChanges();

      expect(component.otpSent()).toBe(false);
      expect(component.otpVerified()).toBe(false);
      expect(component.countdown()).toBe(0);
      expect(component.emailOtpAttempts.size).toBe(0);
    });
  });

  describe('deleteProfilePic', () => {
    it('should delete profile picture successfully', fakeAsync(() => {
      mockUserProfileService.updateProfilePic.mockReturnValue(of({ result: true }));

      component.profilePicUrl = 'custom-pic.png';
      component.isImageError = true;

      component.deleteProfilePic();
      tick();

      expect(mockUserProfileService.updateProfilePic).toHaveBeenCalled();
      expect(component.profilePicUrl).toBe(defaultProfilePic);
      expect(component.isImageError).toBe(false);
      expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(
        platformMessages.successTitle,
        platformMessages.profileDeleteSuccess,
      );
    }));

    it('should show error if delete fails', fakeAsync(() => {
      mockUserProfileService.updateProfilePic.mockReturnValue(
        throwError(() => new Error('Delete failed')),
      );

      component.deleteProfilePic();
      tick();

      expect(mockSnackbar.showError).toHaveBeenCalledWith(
        platformMessages.errorTitle,
        platformMessages.profileDeleteFailure,
      );
    }));

    it('should send empty string as ProfilePic in FormData', fakeAsync(() => {
      mockUserProfileService.updateProfilePic.mockReturnValue(of({ result: true }));

      component.deleteProfilePic();
      tick();

      expect(mockUserProfileService.updateProfilePic).toHaveBeenCalledWith(expect.any(FormData));
    }));
  });

  describe('hasCustomProfilePic', () => {
    it('should return false if profilePicUrl is default', () => {
      component.profilePicUrl = defaultProfilePic;
      component.isImageError = false;

      expect(component.hasCustomProfilePic()).toBe(false);
    });

    it('should return false if isImageError is true', () => {
      component.profilePicUrl = 'custom-pic.png';
      component.isImageError = true;

      expect(component.hasCustomProfilePic()).toBe(false);
    });

    it('should return true if profilePicUrl is custom and no error', () => {
      component.profilePicUrl = 'custom-pic.png';
      component.isImageError = false;

      expect(component.hasCustomProfilePic()).toBe(true);
    });

    it('should return false if both default pic and image error', () => {
      component.profilePicUrl = defaultProfilePic;
      component.isImageError = true;

      expect(component.hasCustomProfilePic()).toBe(false);
    });
  });

  describe('profileImageError', () => {
    it('should set profilePicUrl to default and mark isImageError as true', () => {
      component.profilePicUrl = 'some-url.png';
      component.isImageError = false;

      component.profileImageError();

      expect(component.profilePicUrl).toBe(defaultProfilePic);
      expect(component.isImageError).toBe(true);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('loadAdminProfile & listenToEmailChanges', () => {
    beforeEach(() => {
      component.ngOnInit(); // ensures form built
    });

    it('should patch form and update profile info on loadAdminProfile success', fakeAsync(() => {
      const mockProfile = {
        result: true,
        data: {
          fullName: 'Admin Tester',
          userName: 'admintest',
          email: 'admin@test.com',
          bio: 'hello bio',
          profilePic: 'pic.jpg',
        },
      };
      mockUserProfileService.getAdminProfile.mockReturnValue(of(mockProfile));

      // call private method via casting
      (component as any).loadAdminProfile();
      tick();

      expect(component.adminProfileForm.value.fullName).toBe('Admin Tester');
      expect(component.headerFullName).toBe('Admin Tester');
      expect(component.headerEmail).toBe('admin@test.com');
      expect(component.profilePicUrl).toContain('pic.jpg');
      expect(component.backendEmail()).toBe('admin@test.com');
      expect(component.verifiedEmail()).toBe('admin@test.com');
      expect(component.otpVerified()).toBe(true);
    }));

    it('should show error when loadAdminProfile fails', fakeAsync(() => {
      mockUserProfileService.getAdminProfile.mockReturnValue(
        throwError(() => ({ error: { message: 'fail msg' } })),
      );

      (component as any).loadAdminProfile();
      tick();

      expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'fail msg');
    }));

    it('should react to email changes and add validators when new email is different', fakeAsync(() => {
      const control = component.adminProfileForm.get('email');

      // start listening
      (component as any).listenToEmailChanges();

      control?.setValue('first@test.com');
      tick();

      // simulate user typing a new email
      control?.setValue('new@test.com');
      tick();

      expect(component.lastTypedEmail).toBe('new@test.com');
      expect(component.emailOtpAttempts.has('new@test.com')).toBe(true);
    }));

    it('should not update when email stays the same', fakeAsync(() => {
      const control = component.adminProfileForm.get('email');
      component.lastTypedEmail = 'same@test.com';

      jest.spyOn(component, 'stopCountdown');

      (component as any).listenToEmailChanges();
      control?.setValue('same@test.com');
      tick();

      expect(component.stopCountdown).not.toHaveBeenCalled();
    }));

    it('should clear validators on otp when email equals backend and otpVerified is true', fakeAsync(() => {
      const emailControl = component.adminProfileForm.get('email');
      const otpControl = component.adminProfileForm.get('otp');

      component.backendEmail.set('backend@test.com');
      component.otpVerified.set(true);

      // start listening
      (component as any).listenToEmailChanges();

      emailControl?.setValue('backend@test.com');
      tick();

      otpControl?.updateValueAndValidity();

      expect(otpControl?.hasValidator(Validators.required)).toBe(false);
    }));
  });
});
