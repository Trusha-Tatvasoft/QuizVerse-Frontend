import { TestBed } from '@angular/core/testing';

import { LeaderboardService } from './leaderboard.service';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import {
  CategoryLeaderEntry,
  LeaderboardEntry,
  MonthlyLeaderEntry,
  UserLeaderboardStats,
  WeeklyLeaderEntry,
} from '../../../pages/user/user-leaderboard/interfaces/user-leaderboard.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { of, throwError } from 'rxjs';
import { CommonListDropDown } from '../../../shared/interfaces/common-dropdown.interface';

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

  describe('getWeeklyLeaderboard', () => {
    it('should call HttpClient.get with the correct URL and return weekly leaderboard data', (done) => {
      const mockResponse: ApiResponse<WeeklyLeaderEntry[]> = {
        result: true,
        data: [
          {
            rank: 1,
            userId: 201,
            userName: 'Bob',
            fullName: 'Bob Johnson',
            profilePic: 'https://example.com/bob.png',
            totalXp: 950,
            totalQuizzesPlayed: 4,
            totalBattlesPlayed: 3,
            isLoggedInUser: true,
          },
        ],
        message: 'Fetched successfully',
        statusCode: 200,
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getWeeklyLeaderboard().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.statusCode).toBe(200);
        expect(response.data[0].userName).toBe('Bob');
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `${environment.baseUrl}/${EndPoints.WeeklyLeaderboard}`,
        );
        done();
      });
    });

    it('should propagate error if HttpClient.get fails', (done) => {
      const error = { status: 404, message: 'Not found' };

      httpClientMock.get.mockReturnValue(throwError(() => error));

      service.getWeeklyLeaderboard().subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (err) => {
          expect(err.status).toBe(404);
          expect(err.message).toBe('Not found');
          expect(httpClientMock.get).toHaveBeenCalledWith(
            `${environment.baseUrl}/${EndPoints.WeeklyLeaderboard}`,
          );
          done();
        },
      });
    });
  });

  describe('getCategoryLeaderboard', () => {
    it('should call HttpClient.get with the correct URL and return category leaderboard data', (done) => {
      const categoryId = 10;
      const mockResponse: ApiResponse<CategoryLeaderEntry[]> = {
        result: true,
        data: [
          {
            rank: 1,
            userId: 301,
            userName: 'Charlie',
            fullName: 'Charlie Brown',
            profilePic: 'https://example.com/charlie.png',
            averageScore: 85.5,
            totalQuizzesPlayed: 7,
            totalBattlesPlayed: 2,
            isLoggedInUser: false,
          },
        ],
        message: 'Category leaderboard fetched successfully',
        statusCode: 200,
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getCategoryLeaderboard(categoryId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.statusCode).toBe(200);
        expect(response.data[0].userName).toBe('Charlie');
        expect(response.data[0].averageScore).toBe(85.5);
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `${environment.baseUrl}/${EndPoints.CategoryLeaderboard}?categoryId=${categoryId}`,
        );
        done();
      });
    });

    it('should propagate error if HttpClient.get fails', (done) => {
      const categoryId = 10;
      const error = { status: 500, message: 'Internal Server Error' };

      httpClientMock.get.mockReturnValue(throwError(() => error));

      service.getCategoryLeaderboard(categoryId).subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (err) => {
          expect(err.status).toBe(500);
          expect(err.message).toBe('Internal Server Error');
          expect(httpClientMock.get).toHaveBeenCalledWith(
            `${environment.baseUrl}/${EndPoints.CategoryLeaderboard}?categoryId=${categoryId}`,
          );
          done();
        },
      });
    });
  });

  describe('getAvailableYears', () => {
    it('getAvailableYears should call HttpClient.get with correct URL and return data', (done) => {
      const mockResponse: ApiResponse<CommonListDropDown[]> = {
        result: true,
        data: [
          { id: 2023, name: '2023' },
          { id: 2024, name: '2024' },
        ],
        message: 'Available years retrieved successfully.',
        statusCode: 200,
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getAvailableYears().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `${environment.baseUrl}/${EndPoints.AvailableYears}`,
        );
        done();
      });
    });

    it('getAvailableYears should propagate error if HttpClient.get fails', (done) => {
      const error = { status: 500, message: 'Server error' };
      httpClientMock.get.mockReturnValue(throwError(() => error));

      service.getAvailableYears().subscribe({
        next: () => fail('Expected an error'),
        error: (err) => {
          expect(err.status).toBe(500);
          expect(err.message).toBe('Server error');
          done();
        },
      });
    });
  });

  describe('getAvailableMonthsByYear', () => {
    it('getAvailableMonthsByYear should call HttpClient.get with correct URL and return data', (done) => {
      const year = 2025;
      const mockResponse: ApiResponse<CommonListDropDown[]> = {
        result: true,
        data: [
          { id: 1, name: 'January' },
          { id: 2, name: 'February' },
        ],
        message: `Available months for ${year} retrieved successfully.`,
        statusCode: 200,
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getAvailableMonthsByYear(year).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `${environment.baseUrl}/${EndPoints.AvailableMonths}/${year}`,
        );
        done();
      });
    });

    it('getAvailableMonthsByYear should propagate error if HttpClient.get fails', (done) => {
      const year = 2025;
      const error = { status: 404, message: 'Not found' };
      httpClientMock.get.mockReturnValue(throwError(() => error));

      service.getAvailableMonthsByYear(year).subscribe({
        next: () => fail('Expected an error'),
        error: (err) => {
          expect(err.status).toBe(404);
          expect(err.message).toBe('Not found');
          expect(httpClientMock.get).toHaveBeenCalledWith(
            `${environment.baseUrl}/${EndPoints.AvailableMonths}/${year}`,
          );
          done();
        },
      });
    });
  });

  describe('getMonthlyChampions', () => {
    it('getMonthlyChampions should call HttpClient.get with correct URL and return data', (done) => {
      const month = 9;
      const year = 2025;

      const mockResponse: ApiResponse<MonthlyLeaderEntry[]> = {
        result: true,
        data: [
          {
            rank: 1,
            userId: 101,
            userName: 'Alice',
            fullName: 'Alice Smith',
            profilePic: 'https://example.com/alice.png',
            totalXp: 500,
            averageScore: 95,
            totalQuizzesPlayed: 5,
            totalBattlesPlayed: 3,
            isLoggedInUser: false,
          },
        ],
        message: 'Monthly champions retrieved successfully.',
        statusCode: 200,
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      service.getMonthlyChampions(month, year).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `${environment.baseUrl}/${EndPoints.MonthlyChampions}?month=${month}&year=${year}`,
        );
        done();
      });
    });

    it('getMonthlyChampions should propagate error if HttpClient.get fails', (done) => {
      const month = 9;
      const year = 2025;
      const error = { status: 400, message: 'Bad request' };

      httpClientMock.get.mockReturnValue(throwError(() => error));

      service.getMonthlyChampions(month, year).subscribe({
        next: () => fail('Expected an error'),
        error: (err) => {
          expect(err.status).toBe(400);
          expect(err.message).toBe('Bad request');
          expect(httpClientMock.get).toHaveBeenCalledWith(
            `${environment.baseUrl}/${EndPoints.MonthlyChampions}?month=${month}&year=${year}`,
          );
          done();
        },
      });
    });
  });
});
