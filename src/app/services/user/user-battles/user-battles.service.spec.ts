import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserBattlesService } from './user-battles.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { UserBattleLeaderboardData } from '../../../pages/user/user-battles/interface/user-battles.interface';
import { AvailableBattle } from '../../../pages/user/user-battles/interface/quiz-battles.interface';
import { BattleUserSearchResult } from '../../../pages/user/user-battles/available-battles/interfaces/challenge-friend.interface';

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

  it('should fetch battle instruction by ID', () => {
    const battleAttemptId = 123;
    const mockResponse: ApiResponse<any> = {
      result: true,
      message: 'Battle instruction fetched successfully',
      data: {
        battleAttemptId: battleAttemptId,
        battleName: 'Sample Battle',
        battleCategory: 'General Knowledge',
        totalQuestions: 10,
        duration: '10m',
        instructions: 'Answer all questions to the best of your ability.',
        playerProfile: {
          userId: 1,
          userName: 'PlayerOne',
          profilePic: 'http://example.com/playerone.jpg',
        },
        opponentProfile: {
          userId: 2,
          userName: 'PlayerTwo',
          profilePic: 'http://example.com/playertwo.jpg',
        },
      },
      statusCode: 200,
    };

    service.getBattleInstruction(battleAttemptId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.data.battleAttemptId).toBe(battleAttemptId);
      expect(res.data.battleName).toBe('Sample Battle');
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.GetBattleInstruction}/${battleAttemptId}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should send a battle request correctly', () => {
    const receiverUsername = 'johnDoe';
    const battleId = 5;

    const mockResponse: ApiResponse<null> = {
      result: true,
      message: 'Request sent successfully',
      data: null,
      statusCode: 200,
    };

    service.sendBattleRequest(receiverUsername, battleId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.SendBattleRequest}`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      receiverUsername,
      battleId,
    });

    req.flush(mockResponse);
  });

  it('should check if a user exists by username', () => {
    const username = 'johnDoe';

    const mockResponse: ApiResponse<null> = {
      result: true,
      message: 'User exists',
      data: null,
      statusCode: 200,
    };

    service.checkUserExistence(username).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.CheckUserExistence}/${username}`,
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Skip-Loader')).toBe('true');

    req.flush(mockResponse);
  });

  it('should search users by username and battleId', () => {
    const userName = 'john';
    const battleId = 3;

    const mockResponse: ApiResponse<BattleUserSearchResult[]> = {
      result: true,
      message: 'Search completed',
      data: [
        {
          fullName: 'John Doe',
          userName: 'john123',
          profilePic: 'https://xyz.com/profile.png',
          totalXp: 500,
          hasRequest: false,
        },
      ],
      statusCode: 200,
    };

    service.searchUsers(userName, battleId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.data.length).toBe(1);
      expect(res.data[0].userName).toBe('john123');
    });

    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${environment.baseUrl}/${EndPoints.SearchUser}` &&
        request.params.get('userName') === userName &&
        request.params.get('battleId') === battleId.toString()
      );
    });

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Skip-Loader')).toBe('true');

    req.flush(mockResponse);
  });
});
