import { TestBed } from '@angular/core/testing';
import { BattleHubService } from './battle-hub.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { PlayerProfileDTO } from '../../../pages/user/user-battles/interface/search-opponent.interface';

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
        'Connection failed: Connection failed',
      );
      expect(service['isConnected']).toBe(false);
      expect(service['connectionPromise']).toBe(null);
    });

    it('should return existing connection promise if already connecting', async () => {
      mockHubConnection.start.mockResolvedValue(undefined);

      const firstCall = service.connect();
      const secondCall = service.connect();

      // Both should return the same promise instance
      expect(firstCall).toEqual(secondCall);
      await firstCall;
      expect(service['isConnected']).toBe(true);
    });
  });

  describe('event handlers', () => {
    let searchingHandler: Function | undefined;
    let matchFoundHandler: Function | undefined;
    let reconnectingHandler: Function | undefined;
    let reconnectedHandler: Function | undefined;
    let closeHandler: Function | undefined;

    beforeEach(() => {
      // Reset mocks to ensure clean state
      mockHubConnection.on.mockReset();
      mockHubConnection.onreconnecting.mockReset();
      mockHubConnection.onreconnected.mockReset();
      mockHubConnection.onclose.mockReset();

      // Capture the event handlers when they are registered
      mockHubConnection.on.mockImplementation((event: string, handler: Function) => {
        if (event === 'Searching') searchingHandler = handler;
        if (event === 'MatchFound') matchFoundHandler = handler;
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

      // Register handlers after setting up mocks
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
        fullName: 'test user',
        winRate: 75,
      };

      matchFoundHandler!(mockPlayer);
      expect(matchFoundSpy).toHaveBeenCalledWith(mockPlayer);
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith('Matched with test-user!');
    });

    it('should handle null result in MatchFound', () => {
      expect(matchFoundHandler).toBeDefined();
      const matchFoundSpy = jest.spyOn(service['matchFound$'], 'next');

      matchFoundHandler!(null);
      expect(matchFoundSpy).toHaveBeenCalledWith(null);
      expect(mockSnackbarService.showSuccess).not.toHaveBeenCalled();
    });

    it('should handle reconnecting event', () => {
      expect(reconnectingHandler).toBeDefined();
      reconnectingHandler!(new Error('Connection lost. Reconnecting...'));
      expect(mockSnackbarService.showInfo).toHaveBeenCalledWith('Connection lost. Reconnecting...');
    });

    it('should handle reconnected event', () => {
      expect(reconnectedHandler).toBeDefined();
      reconnectedHandler!('new-connection-id');
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith('Connection restored');
    });

    it('should handle connection close with error', () => {
      expect(closeHandler).toBeDefined();
      closeHandler!(new Error('Connection closed unexpectedly'));
      expect(service['isConnected']).toBe(false);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Connection closed unexpectedly');
    });

    it('should handle connection close without error', () => {
      expect(closeHandler).toBeDefined();
      closeHandler!(null);
      expect(service['isConnected']).toBe(false);
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });
  });

  describe('connection status', () => {
    it('should return correct connected status', async () => {
      expect(service.connected).toBe(true);

      mockHubConnection.state = 'Disconnected';
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

    it('should start matchmaking when connected', () => {
      mockHubConnection.invoke.mockResolvedValue(undefined);
      service.startMatchmaking(123);
      expect(mockHubConnection.invoke).toHaveBeenCalledWith('StartMatchmaking', 123);
    });

    it('should show error when starting matchmaking without connection', () => {
      service['isConnected'] = false;
      service.startMatchmaking(123);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Not connected to server');
      expect(mockHubConnection.invoke).not.toHaveBeenCalled();
    });

    it('should handle start matchmaking failure', async () => {
      const error = new Error('Server error');
      mockHubConnection.invoke.mockRejectedValue(error);

      service.startMatchmaking(123);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Server error');
    });

    it('should handle start matchmaking failure null errro', async () => {
      const error = new Error('');
      mockHubConnection.invoke.mockRejectedValue(error);

      service.startMatchmaking(123);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Failed to start matchmaking');
    });

    it('should cancel matchmaking when connected', () => {
      mockHubConnection.invoke.mockResolvedValue(undefined);
      service.cancelMatchmaking(123);
      expect(mockHubConnection.invoke).toHaveBeenCalledWith('CancelMatchmaking', 123);
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
  });

  describe('stopConnection', () => {
    beforeEach(async () => {
      mockHubConnection.start.mockResolvedValue(undefined);
      await service.connect();
    });

    it('should stop connection successfully', async () => {
      mockHubConnection.stop.mockResolvedValue(undefined);

      await service.stopConnection();

      expect(mockHubConnection.stop).toHaveBeenCalled();
      expect(service['isConnected']).toBe(false);
      expect(service['connectionPromise']).toBe(null);
    });

    it('should handle stop connection failure', async () => {
      mockHubConnection.stop.mockRejectedValue(new Error('Stop failed'));

      await service.stopConnection();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Stop failed');
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
        fullName: 'test user',
        winRate: 75,
      };

      service.onMatchFound.subscribe((player) => {
        expect(player).toEqual(mockPlayer);
        done();
      });

      service['matchFound$'].next(mockPlayer);
    });
  });
});
