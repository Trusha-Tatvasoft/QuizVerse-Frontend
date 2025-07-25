import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LandingPageStats } from '../../../shared/interfaces/landing-page-stats.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';

@Injectable({
  providedIn: 'root',
})
export class LandingPageDataService {
  private readonly http = inject(HttpClient);

  getStats(): Observable<ApiResponse<LandingPageStats>> {
    return this.http.get<ApiResponse<LandingPageStats>>(
      `${environment.baseUrl}/${EndPoints.LandingPageData}`,
    );
  }
}
