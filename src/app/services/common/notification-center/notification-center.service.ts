import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NotificationCenterRequest } from '../../../pages/layout/interfaces/notification-center.request.interfaces';
import { NotificationCenterApiResponse } from '../../../pages/layout/interfaces/notification-center.response.interfaces';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { skipLoader } from '../../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class NotificationCenterService {
  private readonly http = inject(HttpClient);

  getNotifications(
    payload: NotificationCenterRequest,
  ): Observable<ApiResponse<NotificationCenterApiResponse>> {
    return this.http.post<ApiResponse<NotificationCenterApiResponse>>(
      `${environment.baseUrl}/${EndPoints.NotificationCenter}`,
      payload,
      {
        headers: new HttpHeaders({
          [skipLoader]: 'true',
        }),
      },
    );
  }

  //mark all as read
  markAllAsRead(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.MarkAsAllRead}`,
      null,
    );
  }

  //Mark single notification as read
  markAsRead(id: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.MarkAsRead}/${id}`,
      null,
    );
  }

  //Delete single notification
  deleteNotification(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${environment.baseUrl}/${EndPoints.NotificationCenter}/${id}`,
    );
  }
}
