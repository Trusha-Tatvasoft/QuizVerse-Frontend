import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserBattlesService } from './user-battles.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { UserBattleLeaderboardData } from '../../../pages/user/user-battles/interface/user-battles.interface';
import { UserRecentBattles } from '../../../pages/user/user-battles/interface/recent-battles.interface';

describe('UserBattlesService (Jest)', () => {
  let service: UserBattlesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserBattlesService],
    });
    service = TestBed.inject(UserBattlesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch battle leaderboard list (success)', () => {
    const mockResponse: ApiResponse<UserBattleLeaderboardData[]> = {
      result: true,
      message: 'success',
      data: [
        { userName: 'testUser', totalWins: 2, winPercentage: 50, totalXp: 100, rank: 1 },
      ] as UserBattleLeaderboardData[],
      statusCode: 200,
    };

    service.getBattleLeaderboardList().subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.data[0].userName).toBe('testUser');
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetBattleLeaderboardList}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch user recent battles (success)', () => {
    const mockResponse: ApiResponse<UserRecentBattles[]> = {
      result: true,
      message: 'success',
      data: [
        {
          opponent: 'Opponent1',
          category: 'Science',
          result: 'Won',
          yourScore: 8,
          opponentScore: 6,
          xpGained: 20,
          battleName: 'Battle XYZ',
        },
      ],
      statusCode: 200,
    };

    service.getUserRecentBattles().subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.data[0].opponent).toBe('Opponent1');
      expect(res.data[0].result).toBe('Won');
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetUserRecentBattles}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error when fetching leaderboard list', () => {
    const errorMessage = 'Internal server error';

    service.getBattleLeaderboardList().subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => {
        expect(err.status).toBe(500);
        expect(err.statusText).toBe('Server Error');
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetBattleLeaderboardList}`);
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });

  it('should handle error when fetching recent battles', () => {
    const errorMessage = 'Service unavailable';

    service.getUserRecentBattles().subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => {
        expect(err.status).toBe(503);
        expect(err.statusText).toBe('Service Unavailable');
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetUserRecentBattles}`);
    req.flush(errorMessage, { status: 503, statusText: 'Service Unavailable' });
  });
});
