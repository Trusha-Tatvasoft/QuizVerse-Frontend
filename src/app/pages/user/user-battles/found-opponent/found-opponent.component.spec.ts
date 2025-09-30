import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FoundOpponentComponent } from './found-opponent.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { CheatPreventionService } from '../../../../shared/service/cheat-prevention/cheat-prevention.service';
import { Subject } from 'rxjs';
import { Navigations } from '../../../../shared/enums/navigation';
import { autoBattleEndMessage, platformMessages } from '../../../../utils/constants';
import { DisableQuizShortcutsDirective } from '../../../../shared/Directives/disable-quiz-shortcuts.directive';
import { PlayerProfileDTO } from '../interface/search-opponent.interface';
import { By } from '@angular/platform-browser';

describe('FoundOpponentComponent', () => {
  let component: FoundOpponentComponent;
  let fixture: ComponentFixture<FoundOpponentComponent>;
  let mockActivatedRoute: any;
  let mockRouter: jest.Mocked<Router>;
  let mockSnackbarService: jest.Mocked<SnackbarService>;
  let mockCheatPreventionService: jest.Mocked<CheatPreventionService>;
  let violationsSubject: Subject<string>;

  const mockOpponent: PlayerProfileDTO = {
    userId: 123,
    userName: 'JohnDoe',
    fullName: 'John Doe',
    currentLevel: 5,
    winRate: 75,
    profilePic: 'https://example.com/john.jpg',
  };

  beforeEach(async () => {
    violationsSubject = new Subject<string>();

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(btoa('123')),
        },
      },
    };

    mockRouter = { navigate: jest.fn() } as any;
    mockSnackbarService = { showError: jest.fn(), showSuccess: jest.fn() } as any;
    mockCheatPreventionService = {
      startMonitoring: jest.fn(),
      stopMonitoring: jest.fn(),
      violations$: violationsSubject.asObservable(),
    } as any;

    // Mock history.state
    jest.spyOn(window.history, 'state', 'get').mockReturnValue({ opponent: mockOpponent });

    // Mock document fullscreen APIs
    if (!('exitFullscreen' in document)) {
      (document as any).exitFullscreen = jest.fn(() => Promise.resolve());
    }
    if (!('webkitExitFullscreen' in document)) {
      (document as any).webkitExitFullscreen = jest.fn();
    }
    if (!('msExitFullscreen' in document)) {
      (document as any).msExitFullscreen = jest.fn();
    }
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });

    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIcon, DisableQuizShortcutsDirective, FoundOpponentComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: CheatPreventionService, useValue: mockCheatPreventionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FoundOpponentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks(); // Restore history.state and document mocks
    violationsSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call decodeRouteId, redirectToBattle, and start monitoring', () => {
      const decodeRouteIdSpy = jest.spyOn(component as any, 'decodeRouteId');
      const redirectToBattleSpy = jest.spyOn(component, 'redirectToBattle');
      const startMonitoringSpy = jest.spyOn(mockCheatPreventionService, 'startMonitoring');

      component.ngOnInit();

      expect(decodeRouteIdSpy).toHaveBeenCalled();
      expect(redirectToBattleSpy).toHaveBeenCalled();
      expect(startMonitoringSpy).toHaveBeenCalled();
    });

    it('should subscribe to violations$ and call completeBattle on violation', fakeAsync(() => {
      const completeBattleSpy = jest.spyOn(component, 'completeBattle');
      component.ngOnInit();

      violationsSubject.next('Cheating detected');
      tick();

      expect(completeBattleSpy).toHaveBeenCalledWith('Cheating detected');
    }));
  });

  describe('decodeRouteId', () => {
    it('should decode valid battle ID and set opponent from history.state', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(btoa('123'));
      jest.spyOn(window.history, 'state', 'get').mockReturnValue({ opponent: mockOpponent });

      component['decodeRouteId']();

      expect(component.battleId).toBe(123);
      expect(component.opponent).toEqual(mockOpponent);
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle missing encodedId and navigate to battle list', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      jest.spyOn(window.history, 'state', 'get').mockReturnValue({});

      component['decodeRouteId']();

      expect(component.battleId).toBeNull();
      expect(component.opponent).toBeNull();
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
      ]);
    });

    it('should handle invalid base64 encoded ID and navigate to battle list', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('invalid-base64');
      jest.spyOn(window.history, 'state', 'get').mockReturnValue({ opponent: mockOpponent });

      component['decodeRouteId']();

      expect(component.battleId).toBeNull();
      expect(component.opponent).toEqual(mockOpponent);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.Battles,
        Navigations.BattleList,
      ]);
    });

    it('should handle non-numeric decoded ID and navigate to battle list', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(btoa('not-a-number'));
      jest.spyOn(window.history, 'state', 'get').mockReturnValue({ opponent: mockOpponent });

      component['decodeRouteId']();

      expect(component.battleId).toBeNull();
      expect(component.opponent).toEqual(mockOpponent);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.Battles,
        Navigations.BattleList,
      ]);
    });

    it('should handle negative or zero battle ID and navigate to battle list', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(btoa('0'));
      jest.spyOn(window.history, 'state', 'get').mockReturnValue({ opponent: mockOpponent });

      component['decodeRouteId']();

      expect(component.battleId).toBeNull();
      expect(component.opponent).toEqual(mockOpponent);
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.Battles,
        Navigations.BattleList,
      ]);
    });
  });

  describe('redirectToBattle', () => {
    it('should navigate to battle instruction route after 2 seconds for valid battleId', fakeAsync(() => {
      component.battleId = 123;

      component.redirectToBattle();
      tick(2000);

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
      ]);
    }));

    it('should show error and navigate to battle list for invalid battleId', () => {
      component.battleId = null;

      component.redirectToBattle();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
      ]);
    });
  });

  describe('completeBattle', () => {
    it('should show error message and not exit fullscreen when not active', async () => {
      Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });

      await component.completeBattle('Cheating detected');

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        autoBattleEndMessage('Cheating detected'),
      );
      expect(document.exitFullscreen).not.toHaveBeenCalled();
      expect((document as any).webkitExitFullscreen).not.toHaveBeenCalled();
      expect((document as any).msExitFullscreen).not.toHaveBeenCalled();
    });

    it('should exit fullscreen using exitFullscreen when active', async () => {
      Object.defineProperty(document, 'fullscreenElement', { value: {}, writable: true });
      (document as any).exitFullscreen.mockResolvedValue(undefined);

      await component.completeBattle('Cheating detected');

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        autoBattleEndMessage('Cheating detected'),
      );
      expect(document.exitFullscreen).toHaveBeenCalled();
      expect((document as any).webkitExitFullscreen).not.toHaveBeenCalled();
      expect((document as any).msExitFullscreen).not.toHaveBeenCalled();
    });

    it('should exit fullscreen using webkitExitFullscreen when exitFullscreen unavailable', async () => {
      Object.defineProperty(document, 'fullscreenElement', { value: {}, writable: true });
      (document as any).exitFullscreen = undefined;

      await component.completeBattle('Cheating detected');

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        autoBattleEndMessage('Cheating detected'),
      );
      expect((document as any).webkitExitFullscreen).toHaveBeenCalled();
      expect((document as any).msExitFullscreen).not.toHaveBeenCalled();
    });

    it('should exit fullscreen using msExitFullscreen when others unavailable', async () => {
      Object.defineProperty(document, 'fullscreenElement', { value: {}, writable: true });
      (document as any).exitFullscreen = undefined;
      (document as any).webkitExitFullscreen = undefined;

      await component.completeBattle('Cheating detected');

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        autoBattleEndMessage('Cheating detected'),
      );
      expect((document as any).msExitFullscreen).toHaveBeenCalled();
    });
  });

  describe('imageError', () => {
    it('should set isImageError to true', () => {
      component.isImageError = false;

      component.imageError();

      expect(component.isImageError).toBe(true);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject and stop monitoring', () => {
      const destroyNextSpy = jest.spyOn(component['destroy$'], 'next');
      const destroyCompleteSpy = jest.spyOn(component['destroy$'], 'complete');
      const stopMonitoringSpy = jest.spyOn(mockCheatPreventionService, 'stopMonitoring');

      component.ngOnDestroy();

      expect(destroyNextSpy).toHaveBeenCalled();
      expect(destroyCompleteSpy).toHaveBeenCalled();
      expect(stopMonitoringSpy).toHaveBeenCalled();
    });
  });
});
