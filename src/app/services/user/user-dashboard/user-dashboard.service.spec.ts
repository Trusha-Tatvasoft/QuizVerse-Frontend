import { TestBed } from '@angular/core/testing';

import { UserDashboardService } from './user-dashboard.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { HttpClient, provideHttpClient } from '@angular/common/http';

describe('UserDashboardService', () => {
  let service: UserDashboardService;
  let httpMock: HttpTestingController;
  let snackBarService: SnackbarService;

  const mockSnackbar = {
    showError: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserDashboardService,
        { provide: SnackbarService, useValue: mockSnackbar },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UserDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
    snackBarService = TestBed.inject(SnackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // getDashboardData
  it('should fetch dashboard data successfully', (done) => {
    const mockResponse = {
      result: true,
      data: {
        userName: 'Alice',
        currentRank: 5,
        quizzesCompleted: 10,
        totalXp: 200,
        winRate: 80,
      },
    };

    service.getDashboardData().subscribe((res) => {
      expect(res.banner.userName).toBe('Alice');
      expect(res.banner.currentRank).toBe(5);
      expect(res.card.quizzesCompleted).toBe(10);
      expect(res.card.totalXp).toBe(200);
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UserDashboardData}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error and call snackBarService', (done) => {
    service.getDashboardData().subscribe({
      error: (err) => {
        expect(err.message).toBe('Failed to load dashboard data.');
        expect(mockSnackbar.showError).toHaveBeenCalledWith(expect.any(String), expect.any(String));
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UserDashboardData}`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
