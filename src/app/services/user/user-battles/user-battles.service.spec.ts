import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserBattlesService } from './user-battles.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { UserBattleLeaderboardData } from '../../../pages/user/user-battles/interface/user-battles.interface';
import {
  AvailableBattle,
  UserAvailableBattlesResponseDto,
} from '../../../pages/user/user-battles/interface/quiz-battles.interface';
import { BattleUserSearchResult } from '../../../pages/user/user-battles/available-battles/interfaces/challenge-friend.interface';
import {
  UserRecentBattlesRequestDto,
  UserRecentBattlesResponseDto,
} from '../../../pages/user/user-battles/interface/recent-battles.interface';

describe('UserBattlesService', () => {
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

  it('should fetch battle leaderboard list', (done) => {
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
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetBattleLeaderboardList}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should call getUserAvailableBattles with default batch number', (done) => {
    const mockBattles: AvailableBattle[] = [
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
        isBattleRunning: 0,
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
        isBattleRunning: 0,
      },
    ];

    const mockResponse: ApiResponse<UserAvailableBattlesResponseDto> = {
      result: true,
      message: 'Fetched battles successfully',
      data: {
        battles: mockBattles,
        hasMore: true,
      },
      statusCode: 200,
    };

    service.getUserAvailableBattles().subscribe((res) => {
      expect(res.result).toBe(true);
      expect(res.data.battles.length).toBe(2);
      expect(res.data.hasMore).toBe(true);
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetUserAvailableBattles}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ batchNumber: 1 });
    req.flush(mockResponse);
  });

  it('should call getUserAvailableBattles with custom batch number', (done) => {
    const batchNumber = 3;
    const mockResponse: ApiResponse<UserAvailableBattlesResponseDto> = {
      result: true,
      message: 'Fetched battles successfully',
      data: {
        battles: [],
        hasMore: false,
      },
      statusCode: 200,
    };

    service.getUserAvailableBattles(batchNumber).subscribe((res) => {
      expect(res.data.hasMore).toBe(false);
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetUserAvailableBattles}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ batchNumber });
    req.flush(mockResponse);
  });

  it('should handle error response when fetching available battles', (done) => {
    const errorMessage = 'Failed to fetch battles';

    service.getUserAvailableBattles().subscribe({
      next: () => fail('expected an error, not data'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetUserAvailableBattles}`);
    expect(req.request.method).toBe('POST');
    req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should fetch battle instruction by ID', (done) => {
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
      done();
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.GetBattleInstruction}/${battleAttemptId}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should send a battle request correctly', (done) => {
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
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.SendBattleRequest}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      receiverUsername,
      battleId,
    });
    req.flush(mockResponse);
  });

  it('should check if a user exists by username', (done) => {
    const username = 'johnDoe';

    const mockResponse: ApiResponse<null> = {
      result: true,
      message: 'User exists',
      data: null,
      statusCode: 200,
    };

    service.checkUserExistence(username).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.CheckUserExistence}/${username}`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Skip-Loader')).toBe('true');
    req.flush(mockResponse);
  });

  it('should search users by username and battleId', (done) => {
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
      done();
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

  it('should fetch user recent battles', (done) => {
    const requestDto: UserRecentBattlesRequestDto = {
      batchNumber: 1,
      filterBy: null,
      timefilterBy: null,
    };

    const mockResponse: ApiResponse<UserRecentBattlesResponseDto | null> = {
      result: true,
      message: 'Recent battles fetched successfully',
      data: {
        battles: [
          {
            battleName: 'Math Battle',
            opponent: 'PlayerTwo',
            opponentFullName: 'John Doe',
            profilePic: 'http://example.com/player2.jpg',
            category: 'Math',
            result: 'Win',
            yourScore: 8,
            opponentScore: 6,
            xpGained: 50,
            battleDate: new Date('2025-10-07T10:00:00Z'),
          },
          {
            battleName: 'Science Battle',
            opponent: 'PlayerThree',
            opponentFullName: 'Jane Smith',
            profilePic: 'http://example.com/player3.jpg',
            category: 'Science',
            result: 'Loss',
            yourScore: 5,
            opponentScore: 7,
            xpGained: 30,
            battleDate: new Date('2025-10-06T15:00:00Z'),
          },
        ],
        hasMore: false,
      } as UserRecentBattlesResponseDto,
      statusCode: 200,
    };

    service.getUserRecentBattles(requestDto).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.data?.battles.length).toBe(2);
      expect(res.data?.battles[0].opponentFullName).toBe('John Doe');
      expect(res.data?.hasMore).toBe(false);
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetUserRecentBattles}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(requestDto);
    req.flush(mockResponse);
  });

  it('should fetch battle result by ID', (done) => {
    const battleId = 456;
    const mockResponse: ApiResponse<any> = {
      result: true,
      message: 'Battle result fetched successfully',
      data: {
        battleName: 'Math Quiz Battle',
        opponentUserName: 'player2',
        playerProfile: 'http://example.com/player1.jpg',
        playerFullName: 'Player One',
        opponentFullName: 'Player Two',
        opponentProfile: 'http://example.com/player2.jpg',
        battleStatus: 1,
        isWin: true,
        playerAttemptedQuestions: 10,
        opponentAttemptedQuestions: 8,
        playerEarnedXP: 100,
      },
      statusCode: 200,
    };

    service.getBattleResult(battleId).subscribe((res) => {
      expect(res.result).toBe(true);
      expect(res.data.battleName).toBe('Math Quiz Battle');
      expect(res.data.isWin).toBe(true);
      expect(res.data.playerEarnedXP).toBe(100);
      expect(res.data.opponentUserName).toBe('player2');
      done();
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.GetBattleResult}/${battleId}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
