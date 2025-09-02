import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import { UserBasicProfile } from '../../../pages/user/user-profile/interfaces/user-profile.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';

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
}
