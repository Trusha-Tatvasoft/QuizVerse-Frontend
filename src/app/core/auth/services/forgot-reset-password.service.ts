import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ForgotCredential, ResetCredential } from '../interfaces/forgot-reset-password.interface';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class ForgotResetPasswordService {
  private readonly http = inject(HttpClient);

  sendResetLink(credentials: ForgotCredential): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.ForgotPassword}`,
      credentials,
    );
  }

  resetPassword(credentials: ResetCredential): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.ResetPassword}`,
      credentials,
    );
  }

  verifyResetToken(token: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${environment.baseUrl}/${EndPoints.VerifyTokenRestPassword}`,
      { resetPasswordToken: token },
    );
  }
}
