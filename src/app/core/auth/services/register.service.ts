import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';
import { RegisterCredential } from '../interfaces/register.interface';
import { skipLoader } from '../../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private readonly http = inject(HttpClient);

  registerUser(credentials: RegisterCredential): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.RegisterUser}`,
      credentials,
    );
  }

  checkUserNameExists(userName: string, id?: number): Observable<ApiResponse<boolean>> {
    let params = new HttpParams().set('userName', userName);
    if (id) {
      params = params.set('id', id.toString());
    }

    return this.http.get<ApiResponse<boolean>>(
      `${environment.baseUrl}/${EndPoints.UserNameAvailable}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
        params,
      },
    );
  }

  checkEmailExists(email: string): Observable<ApiResponse<boolean>> {
    const params = new HttpParams().set('email', email);

    return this.http.get<ApiResponse<boolean>>(
      `${environment.baseUrl}/${EndPoints.EmailAvailable}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
        params,
      },
    );
  }
}
