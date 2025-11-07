import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import {
  AIConfigurationSummary,
  AiUsesDetails,
} from '../../../pages/admin/ai-configuration/interfaces/ai-configuration.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';

@Injectable({
  providedIn: 'root',
})
export class AiConfigurationService {
  private readonly http = inject(HttpClient);

  getAIConfigCardData(): Observable<ApiResponse<AIConfigurationSummary>> {
    return this.http.get<ApiResponse<AIConfigurationSummary>>(
      `${environment.baseUrl}/${EndPoints.AiConfigurationCardData}`,
    );
  }

  getAiUsageDetails(modelName?: number): Observable<ApiResponse<AiUsesDetails>> {
    return this.http.get<ApiResponse<AiUsesDetails>>(
      `${environment.baseUrl}/${EndPoints.AiUsageDetails}?aiModelName=${modelName}`,
    );
  }
}
