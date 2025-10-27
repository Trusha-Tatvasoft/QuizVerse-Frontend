import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { EmailTemplatesResponseDto } from '../../../pages/admin/email-template/configs/email-template.component.config';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { EmailTemplateAction } from '../../../shared/enums/email-template.enum';
import { EmailTemplatesRequest } from '../../../pages/admin/email-template/interfaces/email-template-request.interface';
import { skipLoader } from '../../../utils/constants';

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

  updateEmailTemplateByAction(request: {
    id: number;
    action: EmailTemplateAction;
  }): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(
      `${environment.baseUrl}/${EndPoints.UpdateEmailTemplateByAction}`,
      request,
    );
  }

  getEmailTemplateById(id: number): Observable<ApiResponse<EmailTemplatesResponseDto>> {
    return this.http.get<ApiResponse<EmailTemplatesResponseDto>>(
      `${environment.baseUrl}/${EndPoints.GetEmailTemplateById}/${id}`,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  addOrEditEmailTemplate(request: EmailTemplatesRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(
      `${environment.baseUrl}/${EndPoints.AddOrEditEmailTemplate}`,
      request,
    );
  }
}
