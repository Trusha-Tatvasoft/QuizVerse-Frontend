import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NotificationCenterService } from './notification-center.service';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { NotificationCenterRequest } from '../../../pages/layout/interfaces/notification-center.request.interfaces';

describe('NotificationCenterService', () => {
  let service: NotificationCenterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), NotificationCenterService],
    });

    service = TestBed.inject(NotificationCenterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNotifications', () => {
    it('should return admin notifications when isAdmin = true', () => {
      const payload: NotificationCenterRequest = {
        searchText: '',
        adminCategory: 1,
        userCategory: 0,
        type: 0,
        time: 0,
        notificationStatusSelected: 0,
      };

      const mockResponse: ApiResponse<any> = {
        result: true,
        statusCode: 200,
        message: 'Success',
        data: { notifications: [] },
      };

      service.getNotifications(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.NotificationCenter}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should return user notifications when isAdmin = false', () => {
      const payload: NotificationCenterRequest = {
        searchText: '',
        adminCategory: 0,
        userCategory: 1,
        type: 0,
        time: 0,
        notificationStatusSelected: 0,
      };

      const mockResponse: ApiResponse<any> = {
        result: true,
        statusCode: 200,
        message: 'Success',
        data: { notifications: [] },
      };

      service.getNotifications(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.NotificationCenter}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('markAllAsRead', () => {
    it('should send POST request to mark all notifications as read', () => {
      const mockResponse: ApiResponse<null> = {
        result: true,
        statusCode: 200,
        message: 'All notifications marked as read',
        data: null,
      };

      service.markAllAsRead().subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.MarkAsAllRead}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('markAsRead', () => {
    it('should send POST request to mark a notification as read', () => {
      const mockResponse: ApiResponse<null> = {
        result: true,
        statusCode: 200,
        message: 'Notification marked as read',
        data: null,
      };

      const notifId = '123';

      service.markAsRead(notifId).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.MarkAsRead}/${notifId}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('deleteNotification', () => {
    it('should send DELETE request to delete a notification', () => {
      const mockResponse: ApiResponse<null> = {
        result: true,
        statusCode: 200,
        message: 'Notification deleted',
        data: null,
      };

      const notifId = '456';

      service.deleteNotification(notifId).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.NotificationCenter}/${notifId}`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
