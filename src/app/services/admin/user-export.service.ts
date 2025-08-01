import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginationRequest } from '../../shared/interfaces/pagination-request.interface';
import { environment } from '../../../environments/environment.dev';
import { Observable } from 'rxjs';
import { EndPoints } from '../../shared/enums/end-point.enum';

@Injectable({
  providedIn: 'root',
})
export class UserExportService {
  private readonly http = inject(HttpClient);

  exportUsersToExcel(request: PaginationRequest): Observable<Blob> {
    return this.http.post(`${environment.baseUrl}/${EndPoints.UserExport}`, request, {
      responseType: 'blob',
    });
  }
}
