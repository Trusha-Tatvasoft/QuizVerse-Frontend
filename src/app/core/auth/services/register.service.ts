import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';
import { RegisterCredential } from '../interfaces/register.interface';

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
}
