import { TestBed } from '@angular/core/testing';
import { UserDashboardService } from './user-dashboard.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { provideHttpClient } from '@angular/common/http';
import { platformMessages } from '../../../utils/constants';
import { BattleRequestStatus } from '../../../shared/enums/user-dashboard.enum';

describe('UserDashboardService', () => {
  let service: UserDashboardService;
  let httpMock: HttpTestingController;
  let mockSnackbar: { showError: jest.Mock; showSuccess: jest.Mock };

  beforeEach(() => {
    mockSnackbar = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    };

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
  });

  afterEach(() => {
    httpMock.verify();
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
          currentRank: '5',
          quizzesCompleted: 10,
          totalXp: 200,
          winRate: 80,
        },
      };

      service.getDashboardData().subscribe((res) => {
        expect(res.banner.userName).toBe('Alice');
        expect(res.banner.currentRank).toBe('5');
        expect(res.card.quizzesCompleted).toBe(10);
        expect(res.card.totalXp).toBe(200);
        expect(res.card.winRate).toBe(80);
        expect(res.card.currentRank).toBe('5');
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
            platformMessages.errorTitle,
            platformMessages.errorMessage,
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
      const mockResponse = {
        result: true,
        data: {
          currentRank: 'Gold',
          nextRank: 'Platinum',
          xpNeeded: 1000,
          progressPercent: 75,
        },
        message: 'Success',
      };

      service.getRankProgress().subscribe((res) => {
        expect(res).toEqual(mockResponse.data);
        done();
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RankProgressData}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should throw error when result is false', (done) => {
      const mockResponse = {
        result: false,
        data: null,
        message: 'Failed to fetch rank progress',
      };

      service.getRankProgress().subscribe({
        error: (err) => {
          expect(err.message).toBe('Failed to fetch rank progress');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RankProgressData}`);
      req.flush(mockResponse);
    });

    it('should throw error when data is null', (done) => {
      const mockResponse = {
        result: true,
        data: null,
        message: '',
      };

      service.getRankProgress().subscribe({
        error: (err) => {
          expect(err.message).toBe('Failed to fetch rank progress');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.RankProgressData}`);
      req.flush(mockResponse);
    });
  });

  describe('getFeaturedQuizzes', () => {
    it('should fetch featured quizzes with default batch number', (done) => {
      const mockResponse = {
        result: true,
        data: {
          quizzes: [
            {
              quizId: 1,
              quizName: 'Math Challenge',
              categoryName: 'Math',
              difficultyLevel: 'Medium',
              totalAttempts: 200,
              rating: '4.5',
            },
          ],
          hasMore: true,
        },
      };

      service.getFeaturedQuizzes().subscribe((res) => {
        expect(res).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.GetFeaturedQuizzes}?BatchNumber=1`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('BatchNumber')).toBe('1');
      req.flush(mockResponse);
    });
  });

  describe('getBattleRequests', () => {
    it('should fetch battle requests successfully', (done) => {
      const mockResponse = {
        result: true,
        data: [
          {
            requestId: 1,
            senderUserName: 'Bob',
            senderFullName: 'Bob Builder',
            battleCategory: 'Science',
            battleDifficulty: 'Hard',
            sendingDate: '2025-10-08',
            timeAgo: '2h ago',
          },
        ],
      };

      service.getBattleRequests().subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(res.data[0].senderFullName).toBe('Bob Builder');
        done();
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetBattleRequests}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getRecentQuizzes', () => {
    it('should fetch recent quizzes with default viewAll parameter', (done) => {
      const mockResponse = {
        result: true,
        data: [
          {
            quizName: 'History Quiz',
            categoryName: 'History',
            difficultyLevel: 'Easy',
            score: 80,
            attemptedOn: '2025-10-07',
          },
        ],
      };

      service.getRecentQuizzes().subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(res.data[0].quizName).toBe('History Quiz');
        done();
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.GetRecentQuizzes}?ViewAll=false`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch recent quizzes with viewAll=true', (done) => {
      const mockResponse = {
        result: true,
        data: [
          {
            quizName: 'Geography Quiz',
            categoryName: 'Geography',
            difficultyLevel: 'Medium',
            score: 90,
            attemptedOn: '2025-10-06',
          },
        ],
      };

      service.getRecentQuizzes(true).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.GetRecentQuizzes}?ViewAll=true`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateBattleRequestStatus', () => {
    it('should update battle request status successfully', (done) => {
      const payload = { requestId: 1, status: BattleRequestStatus.acceptRequest };
      const mockResponse = {
        result: true,
        statusCode: 200,
        data: true,
        message: 'Battle request accepted',
      };

      service.updateBattleRequestStatus(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(
          platformMessages.successTitle,
          'Battle request accepted',
        );
        done();
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.UpdateBattleRequestStatus}`,
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });

    it('should throw error when result is false', (done) => {
      const payload = { requestId: 1, status: BattleRequestStatus.declineRequest };
      const mockResponse = {
        result: false,
        data: false,
        message: 'Failed to update',
      };

      service.updateBattleRequestStatus(payload).subscribe({
        error: (err) => {
          expect(err.message).toBe('Failed to update');
          expect(mockSnackbar.showSuccess).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.UpdateBattleRequestStatus}`,
      );
      req.flush(mockResponse);
    });

    it('should throw error when data is false', (done) => {
      const payload = { requestId: 1, status: BattleRequestStatus.acceptRequest };
      const mockResponse = {
        result: true,
        data: false,
        message: 'Update failed',
      };

      service.updateBattleRequestStatus(payload).subscribe({
        error: (err) => {
          expect(err.message).toBe('Update failed');
          done();
        },
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.UpdateBattleRequestStatus}`,
      );
      req.flush(mockResponse);
    });

    it('should handle HTTP error and call snackBarService', (done) => {
      const payload = { requestId: 1, status: BattleRequestStatus.acceptRequest };

      service.updateBattleRequestStatus(payload).subscribe({
        error: () => {
          expect(mockSnackbar.showError).toHaveBeenCalledWith(
            platformMessages.errorTitle,
            platformMessages.errorMessage,
          );
          done();
        },
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.UpdateBattleRequestStatus}`,
      );
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should throw error with default message when message not provided', (done) => {
      const payload = { requestId: 1, status: BattleRequestStatus.acceptRequest };
      const mockResponse = {
        result: false,
        data: false,
        message: '',
      };

      service.updateBattleRequestStatus(payload).subscribe({
        error: (err) => {
          expect(err.message).toBe('Failed to update battle request status');
          done();
        },
      });

      const req = httpMock.expectOne(
        `${environment.baseUrl}/${EndPoints.UpdateBattleRequestStatus}`,
      );
      req.flush(mockResponse);
    });
  });
});
