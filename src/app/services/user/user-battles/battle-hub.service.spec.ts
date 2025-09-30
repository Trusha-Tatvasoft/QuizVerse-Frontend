import { TestBed } from '@angular/core/testing';
import { BattleHubService } from './battle-hub.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import {
  PlayerProfileDTO,
  BattleStartDetails,
} from '../../../pages/user/user-battles/interface/search-opponent.interface';
import { platformMessages } from '../../../utils/constants';

// Create a complete mock for SignalR
const mockHubConnection = {
  start: jest.fn(),
  stop: jest.fn(),
  invoke: jest.fn(),
  on: jest.fn(),
  onreconnecting: jest.fn(),
  onreconnected: jest.fn(),
  onclose: jest.fn(),
  state: 'Connected',
};

jest.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: jest.fn(() => ({
    withUrl: jest.fn().mockReturnThis(),
    withAutomaticReconnect: jest.fn().mockReturnThis(),
    configureLogging: jest.fn().mockReturnThis(),
    build: jest.fn(() => mockHubConnection),
  })),
  HttpTransportType: {
    WebSockets: 1,
  },
  HubConnectionState: {
    Connected: 'Connected',
    Disconnected: 'Disconnected',
    Connecting: 'Connecting',
    Reconnecting: 'Reconnecting',
  },
  LogLevel: {
    Warning: 2,
  },
}));

// Mock dependencies
const mockSnackbarService = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
  showInfo: jest.fn(),
};

const mockAuthService = {
  getAccessToken: jest.fn().mockReturnValue('test-token'),
};

describe('BattleHubService', () => {
  let service: BattleHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BattleHubService,
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    service = TestBed.inject(BattleHubService);

    // Reset all mocks
    jest.clearAllMocks();

    // Ensure hubConnection is set and connected before tests
    service['hubConnection'] = mockHubConnection as any;
    service['isConnected'] = true;
    mockHubConnection.state = 'Connected';
  });

  afterEach(() => {
    // Clean up any connection state
    service['isConnected'] = false;
    service['connectionPromise'] = null;
    service['hubConnection'] = null;
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connect', () => {
    beforeEach(() => {
      // Reset hubConnection to test connect logic
      service['hubConnection'] = null;
      service['isConnected'] = false;
    });

    it('should establish connection successfully', async () => {
      mockHubConnection.start.mockResolvedValue(undefined);

      await service.connect();

      expect(mockHubConnection.start).toHaveBeenCalled();
      expect(service['isConnected']).toBe(true);
      expect(service['hubConnection']).toBe(mockHubConnection);
    });

    it('should handle connection failure', async () => {
      const error = new Error('Connection failed');
      mockHubConnection.start.mockRejectedValue(error);

      await expect(service.connect()).rejects.toThrow('Connection failed');
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        `${platformMessages.connectionFailed} Connection failed`,
      );
      expect(service['isConnected']).toBe(false);
      expect(service['connectionPromise']).toBe(null);
    });

    it('should return existing connection promise if already connecting', async () => {
      mockHubConnection.start.mockResolvedValue(undefined);

      const firstCall = service.connect();
      const secondCall = service.connect();

      expect(firstCall).toEqual(secondCall);
      await firstCall;
      expect(service['isConnected']).toBe(true);
    });
  });

  describe('ensureConnection', () => {
    it('should return immediately if already connected', async () => {
      service['isConnected'] = true;
      mockHubConnection.state = 'Connected';

      await service.ensureConnection();

      expect(mockHubConnection.start).not.toHaveBeenCalled();
    });

    it('should call connect if not connected and no promise exists', async () => {
      service['isConnected'] = false;
      service['connectionPromise'] = null;
      mockHubConnection.start.mockResolvedValue(undefined);

      await service.ensureConnection();

      expect(mockHubConnection.start).toHaveBeenCalled();
      expect(service['isConnected']).toBe(true);
    });

    it('should return existing connection promise if connecting', async () => {
      service['isConnected'] = false;
      mockHubConnection.start.mockResolvedValue(undefined);
      const connectSpy = jest.spyOn(service, 'connect');

      const firstCall = service.ensureConnection();
      const secondCall = service.ensureConnection();

      expect(firstCall).toEqual(secondCall);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      await firstCall;
      expect(service['isConnected']).toBe(true);
    });
  });

  describe('event handlers', () => {
    let searchingHandler: Function | undefined;
    let matchFoundHandler: Function | undefined;
    let battleStartedHandler: Function | undefined;
    let battleResumedHandler: Function | undefined;
    let continueBattleHandler: Function | undefined;
    let playerInterruptedHandler: Function | undefined;
    let battleEndedHandler: Function | undefined;
    let errorHandler: Function | undefined;
    let reconnectingHandler: Function | undefined;
    let reconnectedHandler: Function | undefined;
    let closeHandler: Function | undefined;

    beforeEach(() => {
      mockHubConnection.on.mockReset();
      mockHubConnection.onreconnecting.mockReset();
      mockHubConnection.onreconnected.mockReset();
      mockHubConnection.onclose.mockReset();

      mockHubConnection.on.mockImplementation((event: string, handler: Function) => {
        if (event === platformMessages.battleHubSearching) searchingHandler = handler;
        if (event === platformMessages.battleHubMatchFound) matchFoundHandler = handler;
        if (event === platformMessages.battleHubBattleStarted) battleStartedHandler = handler;
        if (event === platformMessages.battleHubBattleResumed) battleResumedHandler = handler;
        if (event === platformMessages.battleHubContinueBattle) continueBattleHandler = handler;
        if (event === platformMessages.battleHubPlayerInterrupted)
          playerInterruptedHandler = handler;
        if (event === platformMessages.battleHubBattleEndedForPlayer) battleEndedHandler = handler;
        if (event === platformMessages.battleError) errorHandler = handler;
      });

      mockHubConnection.onreconnecting.mockImplementation((handler: Function) => {
        reconnectingHandler = handler;
      });

      mockHubConnection.onreconnected.mockImplementation((handler: Function) => {
        reconnectedHandler = handler;
      });

      mockHubConnection.onclose.mockImplementation((handler: Function) => {
        closeHandler = handler;
      });

      service['registerEventHandlers']();
    });

    it('should register Searching event handler', () => {
      expect(searchingHandler).toBeDefined();
      const searchingSpy = jest.spyOn(service['searching$'], 'next');

      searchingHandler!();
      expect(searchingSpy).toHaveBeenCalled();
    });

    it('should register MatchFound event handler', () => {
      expect(matchFoundHandler).toBeDefined();
      const matchFoundSpy = jest.spyOn(service['matchFound$'], 'next');
      const mockPlayer: PlayerProfileDTO = {
        userName: 'test-user',
        userId: 1,
        currentLevel: 5,
        fullName: 'Test User',
        winRate: 75,
      };

      matchFoundHandler!(mockPlayer);
      expect(matchFoundSpy).toHaveBeenCalledWith(mockPlayer);
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(
        `${platformMessages.matchedWith} test-user!`,
      );
    });

    it('should handle null result in MatchFound', () => {
      expect(matchFoundHandler).toBeDefined();
      const matchFoundSpy = jest.spyOn(service['matchFound$'], 'next');

      matchFoundHandler!(null);
      expect(matchFoundSpy).toHaveBeenCalledWith(null);
      expect(mockSnackbarService.showSuccess).not.toHaveBeenCalled();
    });

    it('should register BattleStarted event handler', () => {
      expect(battleStartedHandler).toBeDefined();
      const battleStartedSpy = jest.spyOn(service['battleStarted$'], 'next');
      const mockDetails: BattleStartDetails = {
        battleAttemptId: 456,
        opponentProfile: {
          userId: 1,
          userName: 'opponent',
          fullName: 'Opponent',
          currentLevel: 5,
          winRate: 75,
        },
        playerProfile: {
          userId: 2,
          userName: 'player',
          fullName: 'Player',
          currentLevel: 5,
          winRate: 80,
        },
        battleName: 'Math Battle',
        totalQuestions: 10,
      };

      battleStartedHandler!(mockDetails);
      expect(battleStartedSpy).toHaveBeenCalledWith(mockDetails);
      expect(service['battleAttemptId']).toBe(456);
    });

    it('should register BattleResumed event handler', () => {
      expect(battleResumedHandler).toBeDefined();
      const battleResumedSpy = jest.spyOn(service['battleResumed$'], 'next');
      const mockDetails: BattleStartDetails = {
        battleAttemptId: 789,
        opponentProfile: {
          userId: 1,
          userName: 'opponent',
          fullName: 'Opponent',
          currentLevel: 5,
          winRate: 75,
        },
        playerProfile: {
          userId: 2,
          userName: 'player',
          fullName: 'Player',
          currentLevel: 5,
          winRate: 80,
        },
        battleName: 'Math Battle',
        totalQuestions: 10,
      };

      battleResumedHandler!(mockDetails);
      expect(battleResumedSpy).toHaveBeenCalledWith(mockDetails);
      expect(service['battleAttemptId']).toBe(789);
    });

    it('should register ContinueBattle event handler', () => {
      expect(continueBattleHandler).toBeDefined();
      const continueBattleSpy = jest.spyOn(service['continueBattle$'], 'next');
      const mockData = { battleAttemptId: 123, message: 'Continue battle' };

      continueBattleHandler!(mockData);
      expect(continueBattleSpy).toHaveBeenCalledWith(mockData);
    });

    it('should register PlayerInterrupted event handler', () => {
      expect(playerInterruptedHandler).toBeDefined();
      const playerInterruptedSpy = jest.spyOn(service['playerInterrupted$'], 'next');
      const mockData = { userId: 1 };

      playerInterruptedHandler!(mockData);
      expect(playerInterruptedSpy).toHaveBeenCalledWith(mockData);
    });

    it('should register BattleEndedForPlayer event handler', () => {
      expect(battleEndedHandler).toBeDefined();
      const battleEndedSpy = jest.spyOn(service['battleEndedForParticularPlayer$'], 'next');
      const mockData = { userId: 2 };

      battleEndedHandler!(mockData);
      expect(battleEndedSpy).toHaveBeenCalledWith(mockData);
    });

    it('should register BattleError event handler', () => {
      expect(errorHandler).toBeDefined();
      const errorSpy = jest.spyOn(service['_errorSubject'], 'next');
      const errorMessage = 'An error occurred';

      errorHandler!(errorMessage);
      expect(errorSpy).toHaveBeenCalledWith(errorMessage);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(errorMessage);
    });

    it('should handle BattleError with null message', () => {
      expect(errorHandler).toBeDefined();
      const errorSpy = jest.spyOn(service['_errorSubject'], 'next');

      errorHandler!(null);
      expect(errorSpy).toHaveBeenCalledWith('An unexpected error occurred.');
      expect(mockSnackbarService.showError).toHaveBeenCalledWith('An unexpected error occurred.');
    });

    it('should handle reconnecting event', () => {
      expect(reconnectingHandler).toBeDefined();
      reconnectingHandler!(new Error('Connection lost. Reconnecting...'));
      expect(mockSnackbarService.showInfo).toHaveBeenCalledWith('Connection lost. Reconnecting...');
    });

    it('should handle reconnecting event with null error', () => {
      expect(reconnectingHandler).toBeDefined();
      reconnectingHandler!(null);
      expect(mockSnackbarService.showInfo).toHaveBeenCalledWith(platformMessages.connectionLost);
    });

    it('should handle reconnected event', () => {
      expect(reconnectedHandler).toBeDefined();
      reconnectedHandler!('new-connection-id');
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(
        platformMessages.connectionRestore,
      );
    });

    it('should handle connection close with error', () => {
      expect(closeHandler).toBeDefined();
      closeHandler!(new Error('Connection closed unexpectedly'));
      expect(service['isConnected']).toBe(false);
      expect(service['connectionPromise']).toBe(null);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Connection closed unexpectedly');
    });

    it('should handle connection close without error', () => {
      expect(closeHandler).toBeDefined();
      closeHandler!(null);
      expect(service['isConnected']).toBe(false);
      expect(service['connectionPromise']).toBe(null);
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });
  });

  describe('connection status', () => {
    it('should return correct connected status', async () => {
      expect(service.connected).toBe(true);

      mockHubConnection.state = 'Disconnected';
      expect(service.connected).toBe(false);

      service['isConnected'] = false;
      mockHubConnection.state = 'Connected';
      expect(service.connected).toBe(false);
    });
  });

  describe('matchmaking', () => {
    beforeEach(async () => {
      mockHubConnection.start.mockResolvedValue(undefined);
      service['hubConnection'] = mockHubConnection as any;
      service['isConnected'] = true;
      mockHubConnection.state = 'Connected';
    });

    it('should start matchmaking when connected', async () => {
      mockHubConnection.invoke.mockResolvedValue(undefined);
      service.startMatchmaking(123);
      expect(mockHubConnection.invoke).toHaveBeenCalledWith(
        platformMessages.battleHubStartMatching,
        123,
      );
    });

    it('should show error when starting matchmaking without connection', () => {
      service['isConnected'] = false;
      service.startMatchmaking(123);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.serverNotConnected,
      );
      expect(mockHubConnection.invoke).not.toHaveBeenCalled();
    });

    it('should handle start matchmaking failure', async () => {
      const error = new Error('Server error');
      mockHubConnection.invoke.mockRejectedValue(error);

      service.startMatchmaking(123);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Server error');
    });

    it('should handle start matchmaking failure with null error', async () => {
      mockHubConnection.invoke.mockRejectedValue({});

      service.startMatchmaking(123);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.failedtoStartMatching,
      );
    });

    it('should cancel matchmaking when connected', async () => {
      mockHubConnection.invoke.mockResolvedValue(undefined);
      service.cancelMatchmaking(123);
      expect(mockHubConnection.invoke).toHaveBeenCalledWith(
        platformMessages.battleHubCancelMatching,
        123,
      );
    });

    it('should not cancel matchmaking when not connected', () => {
      service['isConnected'] = false;
      service.cancelMatchmaking(123);
      expect(mockHubConnection.invoke).not.toHaveBeenCalled();
    });

    it('should handle cancel matchmaking failure', async () => {
      const error = new Error('Failed to cancel matchmaking');
      mockHubConnection.invoke.mockRejectedValue(error);

      service.cancelMatchmaking(123);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Failed to cancel matchmaking');
    });

    it('should handle cancel matchmaking failure with null error', async () => {
      mockHubConnection.invoke.mockRejectedValue({});

      service.cancelMatchmaking(123);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.failedtoCancelMatching,
      );
    });
  });

  describe('resumeBattle', () => {
    beforeEach(async () => {
      mockHubConnection.start.mockResolvedValue(undefined);
      service['hubConnection'] = mockHubConnection as any;
      service['isConnected'] = true;
      mockHubConnection.state = 'Connected';
    });

    it('should resume battle successfully', async () => {
      mockHubConnection.invoke.mockResolvedValue(undefined);

      await service.resumeBattle(456);

      expect(mockHubConnection.invoke).toHaveBeenCalledWith('ResumeBattle', 456);
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });

    it('should handle resume battle failure', async () => {
      const error = new Error('Failed to resume');
      mockHubConnection.invoke.mockRejectedValue(error);
      const errorSpy = jest.spyOn(service['_errorSubject'], 'next');

      await expect(service.resumeBattle(456)).rejects.toThrow('Failed to resume');
      expect(mockHubConnection.invoke).toHaveBeenCalledWith('ResumeBattle', 456);
      expect(errorSpy).toHaveBeenCalledWith('Failed to resume');
    });

    it('should handle resume battle failure with null error', async () => {
      mockHubConnection.invoke.mockRejectedValue({});
      const errorSpy = jest.spyOn(service['_errorSubject'], 'next');

      await expect(service.resumeBattle(456)).rejects.toThrow('Failed to resume battle');
      expect(mockHubConnection.invoke).toHaveBeenCalledWith('ResumeBattle', 456);
      expect(errorSpy).toHaveBeenCalledWith('Failed to resume battle');
    });
  });

  describe('submitAnswer', () => {
    beforeEach(async () => {
      mockHubConnection.start.mockResolvedValue(undefined);
      service['hubConnection'] = mockHubConnection as any;
      service['isConnected'] = true;
      mockHubConnection.state = 'Connected';
    });

    it('should submit answer successfully', async () => {
      mockHubConnection.invoke.mockResolvedValue(undefined);

      await service.submitAnswer(123, 1, 'A');

      expect(mockHubConnection.invoke).toHaveBeenCalledWith('SubmitAnswer', 123, 1, 'A');
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });

    it('should handle submit answer failure', async () => {
      const error = new Error('Failed to submit');
      mockHubConnection.invoke.mockRejectedValue(error);
      const errorSpy = jest.spyOn(service['_errorSubject'], 'next');

      await expect(service.submitAnswer(123, 1, 'A')).rejects.toThrow('Failed to submit');
      expect(mockHubConnection.invoke).toHaveBeenCalledWith('SubmitAnswer', 123, 1, 'A');
      expect(errorSpy).toHaveBeenCalledWith('Failed to submit');
    });

    it('should handle submit answer failure with null error', async () => {
      mockHubConnection.invoke.mockRejectedValue({});
      const errorSpy = jest.spyOn(service['_errorSubject'], 'next');

      await expect(service.submitAnswer(123, 1, 'A')).rejects.toThrow('Failed to submit answer');
      expect(mockHubConnection.invoke).toHaveBeenCalledWith('SubmitAnswer', 123, 1, 'A');
      expect(errorSpy).toHaveBeenCalledWith('Failed to submit answer');
    });
  });

  describe('interruptBattle', () => {
    beforeEach(async () => {
      mockHubConnection.start.mockResolvedValue(undefined);
      service['hubConnection'] = mockHubConnection as any;
      service['isConnected'] = true;
      mockHubConnection.state = 'Connected';
    });

    it('should interrupt battle when connected', () => {
      mockHubConnection.invoke.mockResolvedValue(undefined);

      service.interruptBattle(456);

      expect(mockHubConnection.invoke).toHaveBeenCalledWith('IntruptByPlayer', 456);
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });

    it('should not invoke interrupt when not connected', () => {
      service['isConnected'] = false;

      service.interruptBattle(456);

      expect(mockHubConnection.invoke).not.toHaveBeenCalled();
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });

    it('should handle interrupt battle failure', async () => {
      const error = new Error('Failed to interrupt');
      mockHubConnection.invoke.mockRejectedValue(error);

      service.interruptBattle(456);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockHubConnection.invoke).toHaveBeenCalledWith('IntruptByPlayer', 456);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Failed to interrupt');
    });

    it('should handle interrupt battle failure with null error', async () => {
      mockHubConnection.invoke.mockRejectedValue({});

      service.interruptBattle(456);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockHubConnection.invoke).toHaveBeenCalledWith('IntruptByPlayer', 456);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Failed to interrupt battle');
    });
  });

  describe('getCurrentBattleAttemptId', () => {
    it('should return current battle attempt ID', () => {
      service['battleAttemptId'] = 456;
      expect(service.getCurrentBattleAttemptId()).toBe(456);
    });

    it('should return null when no battle attempt ID is set', () => {
      service['battleAttemptId'] = null;
      expect(service.getCurrentBattleAttemptId()).toBe(null);
    });
  });

  describe('cleanupBattleSubjects', () => {
    it('should complete all subjects and reset battleAttemptId', () => {
      const battleStartedSpy = jest.spyOn(service['battleStarted$'], 'complete');
      const battleResumedSpy = jest.spyOn(service['battleResumed$'], 'complete');
      const continueBattleSpy = jest.spyOn(service['continueBattle$'], 'complete');
      const playerInterruptedSpy = jest.spyOn(service['playerInterrupted$'], 'complete');
      const battleEndedSpy = jest.spyOn(service['battleEndedForParticularPlayer$'], 'complete');
      const errorSpy = jest.spyOn(service['_errorSubject'], 'complete');

      service['battleAttemptId'] = 456;

      service.cleanupBattleSubjects();

      expect(battleStartedSpy).toHaveBeenCalled();
      expect(battleResumedSpy).toHaveBeenCalled();
      expect(continueBattleSpy).toHaveBeenCalled();
      expect(playerInterruptedSpy).toHaveBeenCalled();
      expect(battleEndedSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
      expect(service['battleAttemptId']).toBe(null);
    });
  });

  describe('observables', () => {
    it('should emit searching event', (done) => {
      service.onSearching.subscribe(() => {
        done();
      });

      service['searching$'].next();
    });

    it('should emit matchFound event', (done) => {
      const mockPlayer: PlayerProfileDTO = {
        userName: 'test-user',
        userId: 1,
        currentLevel: 5,
        fullName: 'Test User',
        winRate: 75,
      };

      service.onMatchFound.subscribe((player) => {
        expect(player).toEqual(mockPlayer);
        done();
      });

      service['matchFound$'].next(mockPlayer);
    });

    it('should emit battleStarted event', (done) => {
      const mockDetails: BattleStartDetails = {
        battleAttemptId: 456,
        opponentProfile: {
          userId: 1,
          userName: 'opponent',
          fullName: 'Opponent',
          currentLevel: 5,
          winRate: 75,
        },
        playerProfile: {
          userId: 2,
          userName: 'player',
          fullName: 'Player',
          currentLevel: 5,
          winRate: 80,
        },
        battleName: 'Math Battle',
        totalQuestions: 10,
      };

      service.onBattleStarted.subscribe((details) => {
        expect(details).toEqual(mockDetails);
        done();
      });

      service['battleStarted$'].next(mockDetails);
    });

    it('should emit battleResumed event', (done) => {
      const mockDetails: BattleStartDetails = {
        battleAttemptId: 789,
        opponentProfile: {
          userId: 1,
          userName: 'opponent',
          fullName: 'Opponent',
          currentLevel: 5,
          winRate: 75,
        },
        playerProfile: {
          userId: 2,
          userName: 'player',
          fullName: 'Player',
          currentLevel: 5,
          winRate: 80,
        },
        battleName: 'Math Battle',
        totalQuestions: 10,
      };

      service.onBattleResumed.subscribe((details) => {
        expect(details).toEqual(mockDetails);
        done();
      });

      service['battleResumed$'].next(mockDetails);
    });

    it('should emit continueBattle event', (done) => {
      const mockData = { battleAttemptId: 123, message: 'Continue battle' };

      service['continueBattle$'].subscribe((data) => {
        expect(data).toEqual(mockData);
        done();
      });

      service['continueBattle$'].next(mockData);
    });

    it('should emit playerInterrupted event', (done) => {
      const mockData = { userId: 1 };

      service.onPlayerInterrupted.subscribe((data) => {
        expect(data).toEqual(mockData);
        done();
      });

      service['playerInterrupted$'].next(mockData);
    });

    it('should emit battleEndedForParticularPlayer event', (done) => {
      const mockData = { userId: 2 };

      service.onBattleEndedForParticularPlayer.subscribe((data) => {
        expect(data).toEqual(mockData);
        done();
      });

      service['battleEndedForParticularPlayer$'].next(mockData);
    });

    it('should emit error event', (done) => {
      const errorMessage = 'An error occurred';

      service.onError.subscribe((message) => {
        expect(message).toEqual(errorMessage);
        done();
      });

      service['_errorSubject'].next(errorMessage);
    });
  });
});
