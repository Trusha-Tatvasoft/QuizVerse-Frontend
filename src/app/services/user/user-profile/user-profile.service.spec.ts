import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserProfileService } from '../../../services/user/user-profile/user-profile.service';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { UserBadges } from '../../../pages/user/user-profile/interfaces/user-badges.interface';
import {
  UserBasicProfile,
  UserOverview,
} from '../../../pages/user/user-profile/interfaces/user-profile.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import {
  UserProfileSetting,
  VerifyOtpRequest,
} from '../../../pages/user/user-profile/interfaces/user-profile-setting.interface';

describe('UserProfileService', () => {
  let httpMock: HttpTestingController;
  let service: UserProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserProfileService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user basic profile', () => {
    const mockResponse: ApiResponse<UserBasicProfile> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: {
        userId: 1,
        name: 'John Doe',
        rank: 'Silver',
        nextRank: 'Gold',
        profilePic: 'profile.jpg',
        quizCompleted: 15,
        totalXp: 1200,
        winRate: 75,
        achievements: 5,
        memberSince: '2023-01-01',
        progress: 60,
      },
    };

    service.getUserBasicProfile().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetUserBasicProfile}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update profile picture and emit profileUpdated$', (done) => {
    const formData = new FormData();
    formData.append('file', new File(['dummy'], 'test.png', { type: 'image/png' }));

    const mockResponse: ApiResponse<string> = {
      result: true,
      message: 'Success',
      statusCode: 200,
      data: 'profile-pic.png',
    };

    let emitted = false;
    service.profileUpdated$.subscribe((val) => {
      if (val) emitted = true;
    });

    service.updateProfilePic(formData).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(emitted).toBe(true);
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UpdateProfilePic}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(formData);
    req.flush(mockResponse);
  });

  it('should NOT emit profileUpdated$ if update fails', (done) => {
    const formData = new FormData();
    formData.append('file', new File(['dummy'], 'test.png', { type: 'image/png' }));

    const mockResponse: ApiResponse<string> = {
      result: false,
      message: 'Failed',
      statusCode: 400,
      data: '',
    };

    let emitted = false;
    service.profileUpdated$.subscribe((updated) => {
      emitted = emitted || updated;
    });

    service.updateProfilePic(formData).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(emitted).toBe(false);
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UpdateProfilePic}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(formData);
    req.flush(mockResponse);
  });

  it('should fetch user overview', () => {
    const mockResponse: ApiResponse<UserOverview> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: {
        globalRank: 1,
        bestCategory: 'Math',
        longestStreak: 10,
        recentActivity: [],
      },
    };

    service.getUserOverview().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/UserProfile/get-user-overview`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch user badges', () => {
    const mockResponse: ApiResponse<UserBadges[]> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: [
        {
          badgeId: 101,
          name: 'First Quiz Completed',
          description: 'Awarded for completing your first quiz',
          earned: true,
          badgeType: 1,
        },
      ],
    };

    service.getUserBadges().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/UserProfile/get-user-badges`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch user profile setting', () => {
    const mockResponse: ApiResponse<UserProfileSetting> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: { email: 'test@test.com' } as any,
    };

    service.getUserProfileSetting().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/UserProfile/get-user-profile-setting`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should check email availability with skipLoader header', () => {
    const email = 'test@test.com';
    const mockResponse: ApiResponse<boolean> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: true,
    };

    service.checkEmailAvailable(email).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/UserProfile/is-email-available?email=${encodeURIComponent(email)}`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Skip-Loader')).toBe('true');
    req.flush(mockResponse);
  });

  it('should send OTP', () => {
    const data: UserProfileSetting = { email: 'test@test.com' } as any;
    const mockResponse: ApiResponse<string> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: 'OTP Sent',
    };

    service.sendOtp(data).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/UserProfile/send-otp-to-user`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(mockResponse);
  });

  it('should verify OTP', () => {
    const data: VerifyOtpRequest = {
      email: 'test@test.com',
      otp: '1234',
    } as any;
    const mockResponse: ApiResponse<boolean> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: true,
    };

    service.verifyOtp(data).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/UserProfile/verify-otp`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(mockResponse);
  });

  it('should update user profile and emit profileUpdated$', () => {
    const data: UserProfileSetting = { email: 'test@test.com' } as any;
    const mockResponse: ApiResponse<string> = {
      result: true,
      statusCode: 200,
      message: 'Success',
      data: 'Updated',
    };

    let emitted = false;
    service.profileUpdated$.subscribe((val) => {
      if (val) emitted = true;
    });

    service.updateUserProfile(data).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/UserProfile/update-user-profile`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    req.flush(mockResponse);

    expect(emitted).toBe(true);
  });

  it('should not emit profileUpdated$ if updateUserProfile fails', () => {
    const data: UserProfileSetting = { email: 'test@test.com' } as any;
    const mockResponse: ApiResponse<string> = {
      result: false,
      statusCode: 200,
      message: 'Success',
      data: 'Failed',
    };

    let emitted = false;
    service.profileUpdated$.subscribe((val) => {
      if (val) emitted = true;
    });

    service.updateUserProfile(data).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/UserProfile/update-user-profile`);
    req.flush(mockResponse);

    expect(emitted).toBe(false);
  });
});
