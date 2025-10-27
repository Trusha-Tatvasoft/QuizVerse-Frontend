import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { NavbarData } from '../../../pages/layout/interfaces/navbar.component.interface';

@Injectable({
  providedIn: 'root',
})
export class NavbarDataService {
  private readonly http = inject(HttpClient);

  getNavbarData(): Observable<ApiResponse<NavbarData>> {
    return this.http.get<ApiResponse<NavbarData>>(`${environment.baseUrl}/${EndPoints.NavbarData}`);
  }
}
