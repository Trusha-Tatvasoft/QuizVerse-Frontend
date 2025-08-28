import { TestBed } from '@angular/core/testing';

import { LeaderboardService } from './leaderboard.service';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import {
  LeaderboardEntry,
  UserLeaderboardStats,
} from '../../../pages/user/user-leaderboard/interfaces/user-leaderboard.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { of, throwError } from 'rxjs';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let httpClientMock: jest.Mocked<HttpClient>;

  beforeEach(() => {
    const httpMock = {
      get: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [LeaderboardService, { provide: HttpClient, useValue: httpMock }],
    });

    service = TestBed.inject(LeaderboardService);
    httpClientMock = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserLeaderboardStats', () => {
    it('should call HttpClient.get with the correct URL', (done) => {
      const mockResponse: ApiResponse<UserLeaderboardStats> = {
        result: true,
        data: { globalRank: 1, totalXp: 500, currentLevel: 10 },
        message: 'Fetched successfully',
        statusCode: 200,
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getUserLeaderboardStats().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `${environment.baseUrl}/${EndPoints.UserLeaderboardStats}`,
        );
        done();
      });
    });

    it('should propagate error if HttpClient.get fails', (done) => {
      const error = { status: 500, message: 'Server error' };
      httpClientMock.get.mockReturnValue(throwError(() => error));

      service.getUserLeaderboardStats().subscribe({
        next: () => fail('Expected an error'),
        error: (err) => {
          expect(err.status).toBe(500);
          expect(err.message).toBe('Server error');
          done();
        },
      });
    });
  });

  describe('getGlobalLeaderboard', () => {
    it('should call HttpClient.get with the correct URL and return leaderboard data', (done) => {
      const mockResponse: ApiResponse<LeaderboardEntry[]> = {
        result: true,
        data: [
          {
            rank: 1,
            userId: 101,
            userName: 'Alice',
            fullName: 'Alice Smith',
            profilePic: 'https://example.com/alice.png',
            totalXp: 1200,
            currentLevel: 12,
            currentStreak: 5,
            newGlobalRank: 1,
            trend: 1,
            is_loggedin_user: false,
          },
        ],
        message: 'Fetched successfully',
        statusCode: 200,
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getGlobalLeaderboard().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.statusCode).toBe(200);
        expect(response.data[0].userName).toBe('Alice');
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `${environment.baseUrl}/${EndPoints.GlobalLeaderboard}`,
        );
        done();
      });
    });

    it('should propagate error if HttpClient.get fails', (done) => {
      const error = { status: 404, message: 'Not found' };

      httpClientMock.get.mockReturnValue(throwError(() => error));

      service.getGlobalLeaderboard().subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (err) => {
          expect(err.status).toBe(404);
          expect(err.message).toBe('Not found');
          expect(httpClientMock.get).toHaveBeenCalledWith(
            `${environment.baseUrl}/${EndPoints.GlobalLeaderboard}`,
          );
          done();
        },
      });
    });
  });
});
