import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DropDownType } from '../../enums/dropdown-types.enum';
import { CommonListDropDown } from '../../interfaces/common-dropdown.interface';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../enums/end-point.enum';
import { SnackbarService } from '../snackbar/snackbar.service';
import { skipLoader } from '../../../utils/constants';
import { ApiResponse } from '../../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class DropdownService {
  private readonly http = inject(HttpClient);
  private readonly snackbar = inject(SnackbarService);

  getDropdownData(type: DropDownType): Observable<CommonListDropDown[]> {
    const url = `${environment.baseUrl}/${EndPoints.DropDownData}?type=${type}`;

    const headers = new HttpHeaders({
      [skipLoader]: 'true',
    });

    return this.http.get<ApiResponse<CommonListDropDown[]>>(url, { headers }).pipe(
      map((res) => res.data),
      catchError(() => {
        this.snackbar.showError('Error', 'Failed to load the dropdown');
        return of([]);
      }),
    );
  }
}
