import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { UserListData } from '../../../pages/admin/user-management/interfaces/user-list-data.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  // Inject HttpClient using Angular's inject function
  private readonly http = inject(HttpClient);
  /**
   * Fetch paginated, filtered, sorted user list from backend.
   * @param request - PaginationRequest with search, filters, and sort.
   * @returns Observable of paginated user data.
   */
  getUsers(
    request: PaginationRequest,
  ): Observable<ApiResponse<PaginatedDataResponse<UserListData>>> {
    return this.http
      .post<
        ApiResponse<PaginatedDataResponse<UserListData>>
      >(`${environment.baseUrl}/${EndPoints.UserTableData}`, request)
      .pipe(map((res) => res)); // Extract `data` from wrapped ApiResponse
  }

  /**
   * Fetch excel file from backend.
   * @param request - PaginationRequest with search, filters, and sort.
   * @returns Observable of excel file of user.
   */
  exportUsersToExcel(request: PaginationRequest): Observable<Blob> {
    return this.http.post(`${environment.baseUrl}/${EndPoints.UserExport}`, request, {
      responseType: 'blob',
    });
  }
}
