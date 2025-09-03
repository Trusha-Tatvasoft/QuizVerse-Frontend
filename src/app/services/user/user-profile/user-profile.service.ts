import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import {
  UserBasicProfile,
  UserOverview,
} from '../../../pages/user/user-profile/interfaces/user-profile.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { UserBadges } from '../../../pages/user/user-profile/interfaces/user-badges.interface';
import {
  UserProfileSetting,
  VerifyOtpRequest,
} from '../../../pages/user/user-profile/interfaces/user-profile-setting.interface';
import { skipLoader } from '../../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly profileUpdatedSource = new BehaviorSubject<boolean>(false);
  profileUpdated$ = this.profileUpdatedSource.asObservable();

  /**
   * Fetch the basic user profile (name, email, role, etc.).
   * @returns Observable<ApiResponse<UserBasicProfile>> - User basic profile details wrapped in ApiResponse.
   */
  getUserBasicProfile(): Observable<ApiResponse<UserBasicProfile>> {
    return this.http.get<ApiResponse<UserBasicProfile>>(
      `${environment.baseUrl}/${EndPoints.GetUserBasicProfile}`,
    );
  }

  /**
   * Update the profile picture for the user.
   * On success, triggers the profileUpdated$ BehaviorSubject.
   * @param formData - FormData with file appended
   * @returns Observable<ApiResponse<string>> - Response message (success/failure) from backend.
   */
  updateProfilePic(formData: FormData): Observable<ApiResponse<string>> {
    return this.http
      .post<ApiResponse<string>>(`${environment.baseUrl}/${EndPoints.UpdateProfilePic}`, formData)
      .pipe(
        tap((res) => {
          if (res.result) {
            this.profileUpdatedSource.next(true);
          }
        }),
      );
  }

  getUserOverview(): Observable<ApiResponse<UserOverview>> {
    return this.http.get<ApiResponse<UserOverview>>(
      `${environment.baseUrl}/UserProfile/get-user-overview`,
    );
  }

  getUserBadges(): Observable<ApiResponse<UserBadges[]>> {
    return this.http.get<ApiResponse<UserBadges[]>>(
      `${environment.baseUrl}/UserProfile/get-user-badges`,
    );
  }

  getUserProfileSetting(): Observable<ApiResponse<UserProfileSetting>> {
    return this.http.get<ApiResponse<UserProfileSetting>>(
      `${environment.baseUrl}/UserProfile/get-user-profile-setting`,
    );
  }

  checkEmailAvailable(email: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${environment.baseUrl}/UserProfile/is-email-available?email=${encodeURIComponent(email)}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  sendOtp(data: UserProfileSetting): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${environment.baseUrl}/UserProfile/send-otp-to-user`,
      data,
    );
  }

  verifyOtp(data: VerifyOtpRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${environment.baseUrl}/UserProfile/verify-otp`,
      data,
    );
  }

  updateUserProfile(data: UserProfileSetting) {
    return this.http
      .put<ApiResponse<string>>(`${environment.baseUrl}/UserProfile/update-user-profile`, data)
      .pipe(
        tap((res) => {
          if (res.result) {
            this.profileUpdatedSource.next(true);
          }
        }),
      );
  }
}
