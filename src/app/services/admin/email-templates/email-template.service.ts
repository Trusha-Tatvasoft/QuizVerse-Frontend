import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { EmailTemplatesResponseDto } from '../../../pages/admin/email-template/configs/email-template.component.config';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';

@Injectable({ providedIn: 'root' })
export class EmailTemplateService {
  private readonly http = inject(HttpClient);

  getAllEmailTemplates(
    request: PaginationRequest,
  ): Observable<ApiResponse<PaginatedDataResponse<EmailTemplatesResponseDto>>> {
    return this.http.post<ApiResponse<PaginatedDataResponse<EmailTemplatesResponseDto>>>(
      `${environment.baseUrl}/${EndPoints.EmailTemplateList}`,
      request,
    );
  }
}
