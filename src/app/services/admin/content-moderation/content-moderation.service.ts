import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContentModerationSummary } from '../../../pages/admin/content-moderation/interfaces/content-moderation-summary.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ContentModerationService {
  private readonly http = inject(HttpClient);

  getContentModerationMetricsData(): Observable<ApiResponse<ContentModerationSummary>> {
    return this.http.get<ApiResponse<ContentModerationSummary>>(
      `${environment.baseUrl}/${EndPoints.ContentModerationMatricsData}`,
    );
  }
}
