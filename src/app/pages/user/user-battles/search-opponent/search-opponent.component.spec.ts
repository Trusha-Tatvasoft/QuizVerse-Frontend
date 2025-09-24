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

      mockBattleHubService.onMatchFound.next(mockOpponent);

      expect(component.isSearching).toBe(false);
      expect(component.opponent).toEqual({
        fullName: 'Opponent Player',
        userId: 42,
        currentLevel: 5,
        profilePic: `${environment.imageBaseUrl}/profile.png`,
        userName: 'opponent123',
        winRate: 60,
      });
    });

    it('should subscribe to onSearching and set isSearching to true', async () => {
      mockBattleHubService.connect.mockResolvedValue(undefined);

      await (component as any).connectToHub();

      component.isSearching = false;

      mockBattleHubService.onSearching.next();

      expect(component.isSearching).toBe(true);
    });

    it('should show error snackbar if connect throws', async () => {
      mockBattleHubService.connect.mockRejectedValue(new Error('Connection failed'));

      await (component as any).connectToHub();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Connection failed');
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

    it('should handle invalid battleId and navigate to battles', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(btoa('invalid')));

      component['decodeRouteId']();
      tick();

      expect(component.battleId).toBe(null);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles']);
    }));

    it('should handle missing battleId and navigate to battles', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);

      component['decodeRouteId']();
      tick();

      expect(component.battleId).toBe(null);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles']);
    }));

    it('should set battleData from navigation state', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(btoa('123')));
      mockRouter.getCurrentNavigation.mockReturnValue({
        extras: {
          state: {
            battleData: {
              battleName: 'Math Champions',
              battleCategory: 'Mathematics',
              battleDifficulty: 'Medium',
              battleXp: 150,
            },
          },
        },
      });

      component['decodeRouteId']();
      tick();

      expect(component.battleData).toEqual({
        battleName: 'Math Champions',
        battleCategory: 'Mathematics',
        battleDifficulty: 'Medium',
        battleXp: 150,
      });
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
    }));

    it('should cancel search after 30 seconds', fakeAsync(() => {
      const cancelSpy = jest.spyOn(component, 'cancelSearch');

      component['startSearchTimer']();
      tick(30000);

      expect(component.isSearchTimeOut).toBe(true);
      expect(mockSnackbarService.showWarning).toHaveBeenCalledWith(
        'Search timed out. No opponents found.',
      );
      expect(cancelSpy).toHaveBeenCalled();
    }));
  });

  describe('cancelSearch', () => {
    it('should cancel matchmaking, stop timer, and navigate to battles', fakeAsync(() => {
      component.battleId = 123;
      component['timerInterval'] = setInterval(() => {}, 1000);
      const stopTimerSpy = jest.spyOn(component, 'stopTimer' as any);

      component.cancelSearch();
      tick(100);

      expect(mockBattleHubService.cancelMatchmaking).toHaveBeenCalledWith(123);
      expect(mockSnackbarService.showInfo).toHaveBeenCalledWith('Search cancelled');
      expect(stopTimerSpy).toHaveBeenCalled();
      expect(component.isSearching).toBe(false);
      expect(mockBattleHubService.stopConnection).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([Navigations.User, Navigations.Battles]);
    }));

    it('should not show info message if search timed out', fakeAsync(() => {
      component.battleId = 123;
      component.isSearchTimeOut = true;

      component.cancelSearch();
      tick(100);

      expect(mockSnackbarService.showInfo).not.toHaveBeenCalled();
    }));
  });

  describe('imageError', () => {
    it('should set isImageError to true', () => {
      component.imageError();
      expect(component.isImageError).toBe(true);
    });
  });

  describe('ngOnDestroy', () => {
    it('should clean up timer and hub connection', () => {
      component['timerInterval'] = setInterval(() => {}, 1000);
      const stopTimerSpy = jest.spyOn(component, 'stopTimer' as any);

      component.ngOnDestroy();

      expect(stopTimerSpy).toHaveBeenCalled();
      expect(mockBattleHubService.stopConnection).toHaveBeenCalled();
      expect(component['destroy$'].isStopped).toBe(true);
    });
  });
});
