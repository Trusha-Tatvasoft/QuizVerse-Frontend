import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchOpponentComponent } from './search-opponent.component';
import { CommonModule } from '@angular/common';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { BattleHubService } from '../../../../services/user/user-battles/battle-hub.service';
import { CookieService } from 'ngx-cookie-service';
import { platformMessages } from '../../../../utils/constants';
import { PlayerProfileDTO } from '../interface/search-opponent.interface';
import { Navigations } from '../../../../shared/enums/navigation';
import { environment } from '../../../../../environments/environment.dev';

// Mock dependencies
const mockBattleHubService = {
  connect: jest.fn(),
  startMatchmaking: jest.fn(),
  cancelMatchmaking: jest.fn(),
  stopConnection: jest.fn(),
  onSearching: new Subject<void>(),
  onMatchFound: new Subject<PlayerProfileDTO>(),
  connected: true,
};

const mockSnackbarService = {
  showInfo: jest.fn(),
  showError: jest.fn(),
  showWarning: jest.fn(),
};

const mockRouter = {
  navigate: jest.fn(),
  getCurrentNavigation: jest.fn().mockReturnValue({ extras: { state: {} } }),
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: jest.fn(),
    },
  },
};

const mockCookieService = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('SearchOpponentComponent', () => {
  let component: SearchOpponentComponent;
  let fixture: ComponentFixture<SearchOpponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, OutlineButtonComponent, MatIcon, SearchOpponentComponent],
      providers: [
        { provide: BattleHubService, useValue: mockBattleHubService },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: CookieService, useValue: mockCookieService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchOpponentComponent);
    component = fixture.componentInstance;

    // Reset mocks
    jest.clearAllMocks();
    mockBattleHubService.onMatchFound = new Subject<PlayerProfileDTO>();
    mockBattleHubService.onSearching = new Subject<void>();
  });

  afterEach(() => {
    if (component['timerInterval']) {
      clearInterval(component['timerInterval']);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component and call connectToHub, decodeRouteId, and startSearchTimer', fakeAsync(async () => {
      const connectToHubSpy = jest
        .spyOn(component as any, 'connectToHub')
        .mockResolvedValue(undefined);
      const decodeRouteIdSpy = jest
        .spyOn(component as any, 'decodeRouteId')
        .mockImplementation(() => {});
      const startSearchTimerSpy = jest
        .spyOn(component as any, 'startSearchTimer')
        .mockImplementation(() => {});

      mockBattleHubService.connect.mockResolvedValue(undefined);
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(btoa('123')));

      component.ngOnInit();
      tick();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(connectToHubSpy).toHaveBeenCalled();
      expect(decodeRouteIdSpy).toHaveBeenCalled();
      expect(startSearchTimerSpy).toHaveBeenCalled();
    }));
  });

  describe('connectToHub', () => {
    it('should subscribe to onMatchFound and update opponent when result received', async () => {
      mockBattleHubService.connect.mockResolvedValue(undefined);

      await (component as any).connectToHub();

      const mockOpponent: PlayerProfileDTO = {
        fullName: 'Opponent Player',
        userId: 42,
        currentLevel: 5,
        profilePic: 'profile.png',
        userName: 'opponent123',
        winRate: 60,
      };

      component.battleId = 123;
      mockBattleHubService.onMatchFound.next(mockOpponent);

      expect(component.opponent).toEqual({
        fullName: 'Opponent Player',
        userId: 42,
        currentLevel: 5,
        profilePic: `${environment.imageBaseUrl}/profile.png`,
        userName: 'opponent123',
        winRate: 60,
      });
    });

    it('should navigate to battle page when match is found', async () => {
      mockBattleHubService.connect.mockResolvedValue(undefined);

      await (component as any).connectToHub();

      const mockOpponent: PlayerProfileDTO = {
        fullName: 'Opponent Player',
        userId: 42,
        currentLevel: 5,
        profilePic: 'profile.png',
        userName: 'opponent123',
        winRate: 60,
      };

      component.battleId = 123;

      mockBattleHubService.onMatchFound.next(mockOpponent);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [
          Navigations.User,
          Navigations.Battles,
          Navigations.BattleList,
          Navigations.FoundOpponent,
          btoa(encodeURIComponent('123')),
        ],
        {
          state: { opponent: component.opponent },
        },
      );
    });

    it('should show error snackbar if connect throws', async () => {
      mockBattleHubService.connect.mockRejectedValue(new Error('Connection failed'));

      await (component as any).connectToHub();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Connection failed');
    });

    it('should show generic error if connection fails without specific message', async () => {
      mockBattleHubService.connect.mockRejectedValue({});

      await (component as any).connectToHub();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.matchMakingFailed,
      );
    });
  });

  describe('decodeRouteId', () => {
    it('should decode valid battleId and start matchmaking', fakeAsync(() => {
      mockBattleHubService.connect.mockResolvedValue(undefined);
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(btoa('123')));

      component['decodeRouteId']();
      tick();

      expect(component.battleId).toBe(123);
      expect(mockBattleHubService.startMatchmaking).toHaveBeenCalledWith(123);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should start matchmaking after connection is established if not connected', fakeAsync(() => {
      mockBattleHubService.connected = false;
      mockBattleHubService.connect.mockResolvedValue(undefined);
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(btoa('123')));

      component['decodeRouteId']();
      tick();

      expect(mockBattleHubService.connect).toHaveBeenCalled();
      expect(mockBattleHubService.startMatchmaking).toHaveBeenCalledWith(123);
    }));

    it('should handle invalid battleId and navigate to battles', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(btoa('invalid')));

      component['decodeRouteId']();
      tick();

      expect(component.battleId).toBe(null);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
      ]);
    }));

    it('should handle missing battleId and navigate to battles', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);

      component['decodeRouteId']();
      tick();

      expect(component.battleId).toBe(null);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
      ]);
    }));

    it('should set battleData from navigation state', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(btoa('123')));
      const mockBattleData = {
        battleName: 'Math Champions',
        battleCategory: 'Mathematics',
        battleDifficulty: 'Medium',
        battleXp: 150,
      };

      // Mock history state
      Object.defineProperty(history, 'state', {
        value: { battleData: mockBattleData },
        writable: true,
      });

      component['decodeRouteId']();
      tick();

      expect(component.battleData).toEqual(mockBattleData);
    }));
  });

  describe('startSearchTimer', () => {
    it('should increment searchSeconds every second', fakeAsync(() => {
      component['startSearchTimer']();
      expect(component.searchSeconds).toBe(0);

      tick(1000);
      expect(component.searchSeconds).toBe(1);

      tick(1000);
      expect(component.searchSeconds).toBe(2);

      // Clean up
      component['stopTimer']();
    }));

    it('should cancel search after 30 seconds', fakeAsync(() => {
      const cancelSpy = jest.spyOn(component, 'cancelSearch');

      component['startSearchTimer']();
      tick(30000);

      expect(component.isSearchTimeOut).toBe(true);
      expect(mockSnackbarService.showWarning).toHaveBeenCalledWith(platformMessages.searchTimeOut);
      expect(cancelSpy).toHaveBeenCalled();

      // Clean up
      component['stopTimer']();
    }));

    it('should not exceed 30 seconds', fakeAsync(() => {
      component['startSearchTimer']();

      tick(35000); // 35 seconds

      expect(component.searchSeconds).toBe(30);
      expect(component.isSearchTimeOut).toBe(true);

      // Clean up
      component['stopTimer']();
    }));
  });

  describe('stopTimer', () => {
    it('should clear timer interval and set it to null', () => {
      component['timerInterval'] = setInterval(() => {}, 1000);

      component['stopTimer']();

      expect(component['timerInterval']).toBeNull();
    });

    it('should handle case when timerInterval is null', () => {
      component['timerInterval'] = null;

      expect(() => component['stopTimer']()).not.toThrow();
      expect(component['timerInterval']).toBeNull();
    });
  });

  describe('cancelSearch', () => {
    it('should cancel matchmaking, stop timer, and navigate to battles', fakeAsync(() => {
      component.battleId = 123;
      component['timerInterval'] = setInterval(() => {}, 1000);

      component.cancelSearch();
      tick(100);

      expect(mockBattleHubService.cancelMatchmaking).toHaveBeenCalledWith(123);
      expect(mockSnackbarService.showInfo).toHaveBeenCalledWith(platformMessages.cancelSearch);
      expect(mockBattleHubService.stopConnection).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
      ]);
    }));

    it('should not show info message if search timed out', fakeAsync(() => {
      component.battleId = 123;
      component.isSearchTimeOut = true;

      component.cancelSearch();
      tick(100);

      expect(mockSnackbarService.showInfo).not.toHaveBeenCalled();
    }));

    it('should handle case when battleId is null', fakeAsync(() => {
      component.battleId = null;
      component['timerInterval'] = setInterval(() => {}, 1000);

      component.cancelSearch();
      tick(100);

      expect(mockBattleHubService.cancelMatchmaking).not.toHaveBeenCalled();
      expect(mockSnackbarService.showInfo).toHaveBeenCalledWith(platformMessages.cancelSearch);
    }));
  });

  describe('openFullscreen', () => {
    it('should attempt to open fullscreen with various browser methods', () => {
      const mockElem = {
        requestFullscreen: jest.fn(),
        webkitRequestFullscreen: jest.fn(),
        msRequestFullscreen: jest.fn(),
      };

      jest.spyOn(document, 'documentElement', 'get').mockReturnValue(mockElem as any);

      component.openFullscreen();

      expect(mockElem.requestFullscreen).toHaveBeenCalled();
    });

    it('should try webkit method if standard method not available', () => {
      const mockElem = {
        requestFullscreen: undefined,
        webkitRequestFullscreen: jest.fn(),
        msRequestFullscreen: jest.fn(),
      };

      jest.spyOn(document, 'documentElement', 'get').mockReturnValue(mockElem as any);

      component.openFullscreen();

      expect(mockElem.webkitRequestFullscreen).toHaveBeenCalled();
    });

    it('should try ms method if other methods not available', () => {
      const mockElem = {
        requestFullscreen: undefined,
        webkitRequestFullscreen: undefined,
        msRequestFullscreen: jest.fn(),
      };

      jest.spyOn(document, 'documentElement', 'get').mockReturnValue(mockElem as any);

      component.openFullscreen();

      expect(mockElem.msRequestFullscreen).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should clean up timer, destroy subject, and stop hub connection', () => {
      // Set up timer interval
      component['timerInterval'] = setInterval(() => {}, 1000);
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

      // Spy on internal methods
      const stopTimerSpy = jest.spyOn(component as any, 'stopTimer');
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(stopTimerSpy).toHaveBeenCalled();
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
      expect(component['destroy$'].isStopped).toBe(true);
      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });

    it('should handle ngOnDestroy when timerInterval is null', () => {
      component['timerInterval'] = null;

      expect(() => component.ngOnDestroy()).not.toThrow();
      expect(component['destroy$'].isStopped).toBe(true);
    });
  });

  describe('Component Properties', () => {
    it('should have correct initial values', () => {
      expect(component.cancelSearchButtonConfig).toBeDefined();
      expect(component.searchSeconds).toBe(0);
      expect(component.battleId).toBeNull();
      expect(component.opponent).toBeNull();
      expect(component.battleData).toEqual({
        battleName: 'Math Champions',
        battleCategory: 'Mathematics',
        battleDifficulty: 'Medium',
        battleXp: 150,
      });
      expect(component.isSearchTimeOut).toBe(false);
    });
  });
});
