import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserDashboardService } from './user-dashboard.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';

describe('UserDashboardService', () => {
  let service: UserDashboardService;
  let httpMock: HttpTestingController;
  let snackBarService: SnackbarService;

  const mockSnackbar = {
    showError: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserDashboardService, { provide: SnackbarService, useValue: mockSnackbar }],
    });

    service = TestBed.inject(UserDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
    snackBarService = TestBed.inject(SnackbarService);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboardData', () => {
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
          expect(mockSnackbar.showError).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
          );
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.UserDashboardData}`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getRankProgress', () => {
    it('should fetch rank progress successfully', (done) => {
      const mockRankProgress = {
        currentRank: 5,
        nextRank: 6,
        progressPercent: 70,
        xpNeeded: 150,
      };

      const mockResponse = {
        result: true,
        data: mockRankProgress,
      };

      service.getRankProgress().subscribe((res) => {
        expect(res).toEqual(mockRankProgress);
        done();
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RankProgressData}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should throw error when result is false', (done) => {
      const mockResponse = {
        result: false,
        message: 'Failed to fetch rank',
      };

      service.getRankProgress().subscribe({
        error: (err) => {
          expect(err.message).toBe('Failed to fetch rank');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RankProgressData}`);
      req.flush(mockResponse);
    });

    it('should throw default error when message missing', (done) => {
      const mockResponse = { result: false };

      service.getRankProgress().subscribe({
        next: () => {
          // Should not call next
        },
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('Failed to fetch rank progress'); // ✅ Covers default throw
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RankProgressData}`);
      req.flush(mockResponse);
    });
  });
});
