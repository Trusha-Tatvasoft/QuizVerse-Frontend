import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserBattlesService } from './user-battles.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { UserBattleLeaderboardData } from '../../../pages/user/user-battles/interface/user-battles.interface';
import { AvailableBattle } from '../../../pages/user/user-battles/interface/quiz-battles.interface';
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

  it('should fetch battle leaderboard list', () => {
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

  it('should call getUserAvailableBattles and return data', () => {
    const mockResponse: ApiResponse<AvailableBattle[]> = {
      result: true,
      message: 'Fetched battles successfully',
      data: [
        {
          battleId: 1,
          battleName: 'Math Quiz Battle',
          category: 'Math',
          difficulty: 'Medium',
          description: 'A fun math challenge!',
          maxXP: 100,
          totalQuestions: 10,
          duration: '15m',
          participants: 25,
        },
        {
          battleId: 2,
          battleName: 'Science Trivia',
          category: 'Science',
          difficulty: 'Hard',
          description: 'Test your science knowledge!',
          maxXP: 150,
          totalQuestions: 15,
          duration: '20m',
          participants: 12,
        },
      ] as AvailableBattle[],
      statusCode: 200,
    };

    service.getUserAvailableBattles().subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.result).toBe(true);
      expect(res.data.length).toBe(2);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetUserAvailableBattles}`);

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error response', () => {
    const errorMessage = 'Failed to fetch battles';

    service.getUserAvailableBattles().subscribe({
      next: () => fail('expected an error, not data'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetUserAvailableBattles}`);

    expect(req.request.method).toBe('GET');
    req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
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
});
