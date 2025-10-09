import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FoundOpponentComponent } from './found-opponent.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { CheatPreventionService } from '../../../../shared/service/cheat-prevention/cheat-prevention.service';
import { Subject, of } from 'rxjs';
import { Navigations } from '../../../../shared/enums/navigation';
import {
  autoSubmitBattleMessage,
  platformMessages,
  battleIdStorageKey,
} from '../../../../utils/constants';
import { DisableQuizShortcutsDirective } from '../../../../shared/Directives/disable-quiz-shortcuts.directive';
import { PlayerProfileDTO, BattleStartDetails } from '../interface/search-opponent.interface';
import { MatDialog } from '@angular/material/dialog';
import { BattleHubService } from '../../../../services/user/user-battles/battle-hub.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ConfirmationDialogData } from '../../../../shared/interfaces/confirmation-dialog.interface';
import { cancelButtonConfig } from '../../user-profile/configs/profile-setting.config';
import { saveButtonConfig } from '../../quiz-attempt-layout/configs/quiz-attempt.config';

describe('FoundOpponentComponent', () => {
  let component: FoundOpponentComponent;
  let fixture: ComponentFixture<FoundOpponentComponent>;
  let mockActivatedRoute: any;
  let mockRouter: jest.Mocked<Router>;
  let mockSnackbarService: jest.Mocked<SnackbarService>;
  let mockCheatPreventionService: jest.Mocked<CheatPreventionService>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockBattleHubService: jest.Mocked<BattleHubService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let violationsSubject: Subject<string>;
  let onPlayerInterruptedSubject: Subject<{ userId: number }>;
  let onBattleEndedSubject: Subject<{ userId: number }>;
  let onBattleResumedSubject: Subject<BattleStartDetails>;

  const mockOpponent: PlayerProfileDTO = {
    userId: 123,
    userName: 'JohnDoe',
    fullName: 'John Doe',
    currentLevel: 5,
    winRate: 75,
    profilePic: 'https://example.com/john.jpg',
  };

  const mockBattleStartDetails: BattleStartDetails = {
    battleAttemptId: 456,
    opponentProfile: mockOpponent,
    battleName: 'Math Battle',
    playerProfile: mockOpponent,
    totalQuestions: 10,
  };

  beforeEach(async () => {
    violationsSubject = new Subject<string>();
    onPlayerInterruptedSubject = new Subject<{ userId: number }>();
    onBattleEndedSubject = new Subject<{ userId: number }>();
    onBattleResumedSubject = new Subject<BattleStartDetails>();

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(encodeURIComponent(btoa('123'))),
        },
      },
    };

    mockRouter = {
      navigate: jest.fn(),
    } as any;

    mockSnackbarService = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
      showInfo: jest.fn(),
    } as any;

    mockCheatPreventionService = {
      startMonitoring: jest.fn(),
      stopMonitoring: jest.fn(),
      violations$: violationsSubject.asObservable(),
    } as any;

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true)),
      }),
    } as any;

    mockBattleHubService = {
      connect: jest.fn().mockResolvedValue(undefined),
      interruptBattle: jest.fn(),
      resumeBattle: jest.fn(),
      cleanupBattleEndSubject: jest.fn(),
      onPlayerInterrupted: onPlayerInterruptedSubject.asObservable(),
      onBattleEndedForParticularPlayer: onBattleEndedSubject.asObservable(),
      onBattleResumed: onBattleResumedSubject.asObservable(),
      connected: true,
    } as any;

    mockAuthService = {
      getCurrentUserId: jest.fn().mockReturnValue('789'),
    } as any;

    // Mock history.state
    Object.defineProperty(window.history, 'state', {
      value: { battleStartDetails: mockBattleStartDetails },
      writable: true,
      configurable: true,
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    // Mock document fullscreen APIs
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true,
    });
    (document as any).exitFullscreen = jest.fn(() => Promise.resolve());
    (document as any).webkitExitFullscreen = jest.fn();
    (document as any).msExitFullscreen = jest.fn();

    // Mock window events
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();

    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIcon, DisableQuizShortcutsDirective, FoundOpponentComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: CheatPreventionService, useValue: mockCheatPreventionService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: BattleHubService, useValue: mockBattleHubService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FoundOpponentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    violationsSubject.complete();
    onPlayerInterruptedSubject.complete();
    onBattleEndedSubject.complete();
    onBattleResumedSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set up event listeners, decode route, redirect to battle, cleanup, and start monitoring', () => {
      const decodeRouteIdSpy = jest.spyOn(component as any, 'decodeRouteId');
      const redirectToBattleSpy = jest.spyOn(component, 'redirectToBattle');
      const startMonitoringSpy = jest.spyOn(mockCheatPreventionService, 'startMonitoring');
      const cleanupSpy = jest.spyOn(mockBattleHubService, 'cleanupBattleEndSubject');

      component.ngOnInit();

      expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('pageshow', expect.any(Function));
      expect(decodeRouteIdSpy).toHaveBeenCalled();
      expect(redirectToBattleSpy).toHaveBeenCalled();
      expect(cleanupSpy).toHaveBeenCalled();
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
    it('should decode valid battle ID and set battleStartDetails from history.state', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(btoa('123')));

      Object.defineProperty(window, 'history', {
        value: {
          state: {
            opponent: mockOpponent,
            battleStartDetails: mockBattleStartDetails,
          },
        },
        writable: true,
        configurable: true,
      });

      component['decodeRouteId']();

      expect(component.battleId).toBe(123);
      expect(component.battleStartDetails).toEqual(mockBattleStartDetails);
      expect(component.opponent).toEqual(mockOpponent);
      expect(component.battleAttemptId).toBe(456);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        battleIdStorageKey,
        expect.stringContaining('"attemptedId":456'),
      );
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle missing encodedId and navigate to battle list', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      Object.defineProperty(window.history, 'state', {
        value: {},
        writable: true,
        configurable: true,
      });

      component['decodeRouteId']();

      // battleId remains null when early return happens
      expect(component.battleId).toBeNull();
      expect(component.battleStartDetails).toBeNull();
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
      ]);
    });

    it('should handle invalid base64 encoded ID and navigate to battle list', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('invalid-base64');

      component['decodeRouteId']();

      expect(component.battleId).toBeNull();
      expect(mockSnackbarService.showError).toHaveBeenCalledWith(platformMessages.invalideBattleId);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
      ]);
    });

    it('should handle case when battleStartDetails is not in state', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(encodeURIComponent(btoa('123')));
      Object.defineProperty(window.history, 'state', {
        value: {},
        writable: true,
        configurable: true,
      });

      component['decodeRouteId']();

      expect(component.battleId).toBe(123);
      expect(component.battleStartDetails).toBeNull();
      expect(component.opponent).toBeNull();
      expect(component.battleAttemptId).toBeNull();
    });
  });

  describe('redirectToBattle', () => {
    it('should navigate to battle instruction route after 2 seconds for valid battleId when not reloaded', fakeAsync(() => {
      component.battleId = 123;
      component.reloadAttempted = false;

      component.redirectToBattle();
      tick(2000);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [
          Navigations.User,
          Navigations.Battles,
          Navigations.BattleList,
          Navigations.BattleInstruction,
          btoa(encodeURIComponent('123')),
        ],
        { state: { battleId: btoa(encodeURIComponent('123')) } },
      );
    }));

    it('should navigate to battle question route after 2 seconds when reloaded with battleAttemptId', fakeAsync(() => {
      component.reloadAttempted = true;
      component.battleId = 123;
      component.battleAttemptId = 456;

      component.redirectToBattle();
      tick(2000);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [
          Navigations.User,
          Navigations.Battles,
          Navigations.BattleAttempt,
          btoa(encodeURIComponent('456')),
        ],
        { state: { battleId: btoa(encodeURIComponent('123')) } },
      );
    }));

    it('should show error and navigate to waiting result when reloaded without battleAttemptId', () => {
      component.reloadAttempted = true;
      component.battleId = 123;
      component.battleAttemptId = null;

      component.redirectToBattle();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        'Could not resume the battle. Please start a new battle.',
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [
          Navigations.User,
          Navigations.Battles,
          Navigations.BattleList,
          Navigations.WaitingBattleResult,
          btoa(encodeURIComponent('123')),
        ],
        { state: { battleId: btoa(encodeURIComponent('123')) } },
      );
    });

    it('should show error and navigate for invalid battleId when not reloaded', () => {
      component.battleId = null;
      component.reloadAttempted = false;

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
    it('should show error message, close fullscreen, interrupt battle, and navigate to waiting result', () => {
      component.battleId = 456;
      component.battleAttemptId = 789;
      Object.defineProperty(document, 'fullscreenElement', {
        value: {},
        writable: true,
        configurable: true,
      });

      component.completeBattle('Cheating detected');

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        autoSubmitBattleMessage('Cheating detected'),
      );
      expect(document.exitFullscreen).toHaveBeenCalled();
      expect(mockBattleHubService.interruptBattle).toHaveBeenCalledWith(789);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        Navigations.User,
        Navigations.Battles,
        Navigations.BattleList,
        Navigations.WaitingBattleResult,
        btoa(encodeURIComponent('456')),
      ]);
    });

    it('should connect and then interrupt battle if not connected', async () => {
      component.battleId = 456;
      component.battleAttemptId = 789;
      Object.defineProperty(mockBattleHubService, 'connected', {
        value: false,
        writable: true,
        configurable: true,
      });

      component.completeBattle('Cheating detected');

      await Promise.resolve();

      expect(mockBattleHubService.connect).toHaveBeenCalled();
    });

    it('should handle opponent interruption events', fakeAsync(() => {
      component.battleId = 456;
      component.battleAttemptId = 789;
      component.ngOnInit();

      component.completeBattle('Cheating detected');
      tick();

      onPlayerInterruptedSubject.next({ userId: 999 });
      tick();

      expect(mockSnackbarService.showInfo).toHaveBeenCalledWith(platformMessages.opponentLeft);
    }));

    it('should handle battle ended events for other players', fakeAsync(() => {
      component.battleId = 456;
      component.battleAttemptId = 789;
      component.ngOnInit();

      component.completeBattle('Cheating detected');
      tick();

      onBattleEndedSubject.next({ userId: 999 });
      tick(1500);

      expect(mockSnackbarService.showInfo).toHaveBeenCalledWith(
        platformMessages.opponentBattleEnded,
      );
    }));

    it('should not show info when current user interrupts', fakeAsync(() => {
      component.battleId = 456;
      component.battleAttemptId = 789;
      component.ngOnInit();

      component.completeBattle('Cheating detected');
      tick();

      onPlayerInterruptedSubject.next({ userId: 789 });
      tick();

      expect(mockSnackbarService.showInfo).not.toHaveBeenCalledWith(platformMessages.opponentLeft);
    }));
  });

  describe('resumeBattle', () => {
    it('should open fullscreen and reconnect to hub', () => {
      const openFullscreenSpy = jest.spyOn(component, 'openFullscreen');
      const reconnectToHubSpy = jest.spyOn(component as any, 'reconnectToHub');

      component.resumeBattle();

      expect(openFullscreenSpy).toHaveBeenCalled();
      expect(reconnectToHubSpy).toHaveBeenCalled();
    });
  });

  describe('reconnectToHub', () => {
    it('should connect to hub and resume battle with stored attempt ID', async () => {
      const mockStoredData = { attemptedId: 456, expiry: Date.now() + 600000 };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockStoredData));

      await component['reconnectToHub']();

      expect(mockBattleHubService.connect).toHaveBeenCalled();
      expect(localStorage.getItem).toHaveBeenCalledWith(battleIdStorageKey);
      expect(component.battleAttemptId).toBe(456);
      expect(mockBattleHubService.resumeBattle).toHaveBeenCalledWith(456);
    });

    it('should show error if connection fails', async () => {
      mockBattleHubService.connect.mockRejectedValue(new Error('Connection failed'));

      await component['reconnectToHub']();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Connection failed');
    });

    it('should handle onBattleResumed event and update state', async () => {
      const mockStoredData = { attemptedId: 456, expiry: Date.now() + 600000 };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockStoredData));
      const redirectSpy = jest.spyOn(component, 'redirectToBattle');

      // Call reconnectToHub and wait for the promise to resolve
      await component['reconnectToHub']();

      // Now emit the battle resumed event
      onBattleResumedSubject.next(mockBattleStartDetails);

      // Wait for async operations
      await Promise.resolve();

      expect(component.battleStartDetails).toEqual(mockBattleStartDetails);
      expect(component.battleAttemptId).toBe(456);
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith(platformMessages.battleResumed);
      expect(redirectSpy).toHaveBeenCalled();
    });

    it('should show matchmaking failed error for non-Error exceptions', async () => {
      mockBattleHubService.connect.mockRejectedValue('Some error');

      await component['reconnectToHub']();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.matchMakingFailed,
      );
    });
  });

  describe('openFullscreen and closeFullscreen', () => {
    it('should open fullscreen using standard method', () => {
      const mockElem = {
        requestFullscreen: jest.fn(),
        webkitRequestFullscreen: jest.fn(),
        msRequestFullscreen: jest.fn(),
      };
      jest.spyOn(document, 'documentElement', 'get').mockReturnValue(mockElem as any);

      component.openFullscreen();

      expect(mockElem.requestFullscreen).toHaveBeenCalled();
    });

    it('should open fullscreen using webkit method if standard not available', () => {
      const mockElem = {
        webkitRequestFullscreen: jest.fn(),
        msRequestFullscreen: jest.fn(),
      };
      jest.spyOn(document, 'documentElement', 'get').mockReturnValue(mockElem as any);

      component.openFullscreen();

      expect(mockElem.webkitRequestFullscreen).toHaveBeenCalled();
    });

    it('should open fullscreen using ms method if others not available', () => {
      const mockElem = {
        msRequestFullscreen: jest.fn(),
      };
      jest.spyOn(document, 'documentElement', 'get').mockReturnValue(mockElem as any);

      component.openFullscreen();

      expect(mockElem.msRequestFullscreen).toHaveBeenCalled();
    });

    it('should close fullscreen when active', async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: {},
        writable: true,
        configurable: true,
      });

      await component.closeFullscreen();

      expect(document.exitFullscreen).toHaveBeenCalled();
    });

    it('should not attempt to close fullscreen when not active', () => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        writable: true,
        configurable: true,
      });

      component.closeFullscreen();

      expect(document.exitFullscreen).not.toHaveBeenCalled();
    });

    it('should handle exitFullscreen errors gracefully', async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: {},
        writable: true,
        configurable: true,
      });
      const mockError = new Error('Exit failed');
      (document as any).exitFullscreen = jest.fn(() => Promise.reject(mockError));

      await component.closeFullscreen();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith(
        platformMessages.failedToExitFullScreen,
        mockError,
      );
    });
  });

  describe('showResumeDialog', () => {
    it('should open confirmation dialog and resume battle on confirm', () => {
      const resumeBattleSpy = jest.spyOn(component, 'resumeBattle');
      const completeBattleSpy = jest.spyOn(component, 'completeBattle');

      component['showResumeDialog']();

      expect(mockDialog.open).toHaveBeenCalled();
      expect(resumeBattleSpy).toHaveBeenCalled();
      expect(completeBattleSpy).not.toHaveBeenCalled();
    });

    it('should complete battle when dialog is cancelled', () => {
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(false)),
      } as any);
      const completeBattleSpy = jest.spyOn(component, 'completeBattle');

      component['showResumeDialog']();

      expect(completeBattleSpy).toHaveBeenCalledWith('User chose not to resume the battle');
    });
  });

  describe('Event Handlers', () => {
    it('should set reloadAttempted on beforeunload', () => {
      component['beforeUnloadHandler']({} as BeforeUnloadEvent);

      expect(component.reloadAttempted).toBe(true);
    });

    it('should show resume dialog on pageshow', () => {
      const showResumeDialogSpy = jest.spyOn(component as any, 'showResumeDialog');

      component['pageShowHandler']();

      expect(showResumeDialogSpy).toHaveBeenCalled();
    });
  });

  describe('openConfirmationDialog', () => {
    it('should open dialog with correct configuration', () => {
      const dialogData: ConfirmationDialogData = {
        title: 'Test Title',
        message: 'Test Message',
        cancelButtonConfig: cancelButtonConfig,
        confirmButtonConfig: saveButtonConfig,
      };
      const onConfirm = jest.fn();
      const onCancelClick = jest.fn();

      component.openConfirmationDialog(dialogData, onConfirm, onCancelClick);

      expect(mockDialog.open).toHaveBeenCalledWith(expect.any(Function), {
        width: '600px',
        disableClose: true,
        data: dialogData,
        panelClass: 'custom-dialog-radius',
      });
    });

    it('should call onConfirm when dialog returns true', () => {
      const dialogData: ConfirmationDialogData = {
        title: 'Test Title',
        message: 'Test Message',
        cancelButtonConfig: cancelButtonConfig,
        confirmButtonConfig: saveButtonConfig,
      };
      const onConfirm = jest.fn();
      const onCancelClick = jest.fn();

      component.openConfirmationDialog(dialogData, onConfirm, onCancelClick);

      expect(onConfirm).toHaveBeenCalled();
      expect(onCancelClick).not.toHaveBeenCalled();
    });

    it('should call onCancelClick when dialog returns false', () => {
      mockDialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(false)),
      } as any);

      const dialogData: ConfirmationDialogData = {
        title: 'Test Title',
        message: 'Test Message',
        cancelButtonConfig: cancelButtonConfig,
        confirmButtonConfig: saveButtonConfig,
      };
      const onConfirm = jest.fn();
      const onCancelClick = jest.fn();

      component.openConfirmationDialog(dialogData, onConfirm, onCancelClick);

      expect(onCancelClick).toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('imageError', () => {
    it('should set isImageError to true', () => {
      component.isImageError = false;

      component.imageError();

      expect(component.isImageError).toBe(true);
    });
  });

  describe('getInitials', () => {
    it('should call globalGetInitials utility', () => {
      const result = component.getInitials('John Doe');
      expect(result).toBeDefined();
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
