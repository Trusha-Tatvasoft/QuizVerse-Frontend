import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BattleInstructionComponent } from './battle-instruction.component';
import { BattleHubService } from '../../../../services/user/user-battles/battle-hub.service';
import { UserBattlesService } from '../../../../services/user/user-battles/user-battles.service';
import { CheatPreventionService } from '../../../../shared/service/cheat-prevention/cheat-prevention.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { platformMessages } from '../../../../utils/constants';
import { getSavedBattleId, openFullscreen, saveBattleId } from '../battle-atttempt.helper';
import { Navigations } from '../../../../shared/enums/navigation';

jest.mock('../battle-atttempt.helper');

describe('BattleInstructionComponent', () => {
  let component: BattleInstructionComponent;
  let fixture: ComponentFixture<BattleInstructionComponent>;
  let battleHubService: any;
  let battleService: any;
  let cheatPrevention: any;
  let snackbar: any;
  let router: any;
  let route: any;
  let dialog: any;
  let authService: any;

  beforeEach(async () => {
    battleHubService = {
      connected: false,
      connect: jest.fn().mockResolvedValue(null),
      getCurrentBattleAttemptId: jest.fn(),
      onBattleStarted: new Subject(),
      onPlayerInterrupted: new Subject(),
      onBattleEndedForParticularPlayer: new Subject(),
      interruptBattle: jest.fn(),
      cleanupBattleSubjects: jest.fn(),
    };
    battleService = {
      getBattleInstruction: jest.fn(),
    };
    cheatPrevention = {
      startMonitoring: jest.fn(),
      stopMonitoring: jest.fn(),
      violations$: new Subject<string>(),
    };
    snackbar = {
      showError: jest.fn(),
      showInfo: jest.fn(),
    };
    router = { navigate: jest.fn() };
    route = { snapshot: { paramMap: { get: jest.fn() } } };
    dialog = { open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }) };
    authService = { getCurrentUserId: jest.fn().mockReturnValue(1) };

    await TestBed.configureTestingModule({
      imports: [BattleInstructionComponent],
      providers: [
        { provide: BattleHubService, useValue: battleHubService },
        { provide: UserBattlesService, useValue: battleService },
        { provide: CheatPreventionService, useValue: cheatPrevention },
        { provide: SnackbarService, useValue: snackbar },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: dialog },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleInstructionComponent);
    component = fixture.componentInstance;
  });

  it('should call cheat prevention and set event listeners on init', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    component.ngOnInit();
    expect(cheatPrevention.startMonitoring).toHaveBeenCalled();
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('pageshow', expect.any(Function));
  });

  it('should decode route id successfully and call getBattleInfo', () => {
    const encoded = btoa('123');
    (route.snapshot.paramMap.get as jest.Mock).mockReturnValue(encodeURIComponent(encoded));
    battleHubService.getCurrentBattleAttemptId.mockReturnValue(123);
    const getBattleSpy = jest.spyOn(component, 'getBattleInfo').mockImplementation(jest.fn());

    component.decodeRouteId();
    expect(component.decodedId).toBe(123);
    expect(getBattleSpy).toHaveBeenCalledWith(123);
  });

  it('should handle invalid route id', () => {
    (route.snapshot.paramMap.get as jest.Mock).mockReturnValue('invalid');
    component.decodeRouteId();
    expect(component.decodedId).toBe(0);
    expect(snackbar.showError).toHaveBeenCalledWith(platformMessages.invalidBattleId);
  });

  it('resumeBattleInstruction should call openFullscreen and navigate if battle id exists', () => {
    (getSavedBattleId as jest.Mock).mockReturnValue(42);
    const navigateSpy = jest.spyOn(component, 'navigateToBattle').mockImplementation(jest.fn());
    const openSpy = jest.spyOn(component, 'resumeBattleInstruction');
    component.attemptedId = 0;
    component.resumeBattleInstruction();
    expect(openFullscreen).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(42);
  });

  it('getBattleInfo success scenario', () => {
    const res = { result: true, data: { battleAttemptId: 1, battleCategory: 'Math' } };
    battleService.getBattleInstruction.mockReturnValue(of(res));

    const saveSpy = jest
      .spyOn(component as any, 'startCountdownTimer')
      .mockImplementation(jest.fn());

    component.getBattleInfo(1);
    expect(component.attemptedId).toBe(1);
    expect(saveBattleId).toHaveBeenCalledWith(1);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('getBattleCategoryTagConfig should return correct tag config', () => {
    component.battleInstructions = { battleCategory: 'Science' } as any;
    const config = component.getBattleCategoryTagConfig();
    expect(config.label).toBe('Science');
    expect(config.id).toBe('science');
  });

  it('ngOnDestroy should stop cheat monitoring and remove event listeners', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    component.ngOnDestroy();
    expect(cheatPrevention.stopMonitoring).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('pageshow', expect.any(Function));
  });

  it('handleViolation should mark exit and call completeBattle', () => {
    const completeSpy = jest.spyOn(component, 'completeBattle').mockImplementation(jest.fn());
    component.attemptedId = 10;
    (component as any).handleViolation('reason');
    expect(battleHubService.interruptBattle).toHaveBeenCalledWith(10);
    expect(component.currentUserExitedFullScreen).toBe(true);
    expect(completeSpy).toHaveBeenCalledWith('reason');
  });

  it('countdown timer should navigate after countdown ends', fakeAsync(() => {
    component.decodedId = 1;
    const navigateSpy = jest.spyOn(component, 'navigateToBattle').mockImplementation(jest.fn());
    (component as any).startCountdownTimer();
    tick((component.countdownSeconds + 1) * 1000);
    expect(navigateSpy).toHaveBeenCalledWith(1);
  }));

  it('connectHub should call battleHubService.connect if not connected', async () => {
    battleHubService.connected = false;
    const registerSpy = jest
      .spyOn(component as any, 'registerHubEvents')
      .mockImplementation(jest.fn());
    await (component as any).connectHub();
    expect(battleHubService.connect).toHaveBeenCalled();
    expect(registerSpy).toHaveBeenCalled();
  });

  it('resumeBattleInstruction should show error if no saved battle exists', () => {
    (getSavedBattleId as jest.Mock).mockReturnValue(null);
    component.attemptedId = 0;
    component.resumeBattleInstruction();
    expect(snackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.resumeBattleFailed,
    );
  });

  it('getBattleInfo should show error if API result is false', () => {
    battleService.getBattleInstruction.mockReturnValue(of({ result: false }));
    component.getBattleInfo(1);
    expect(snackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  });

  it('getBattleInfo should show error if API fails', () => {
    const error = { error: { message: 'API failed' } };
    battleService.getBattleInstruction.mockReturnValue({
      subscribe: ({ error: errFn }: any) => errFn(error),
    } as any);
    component.getBattleInfo(1);
    expect(snackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'API failed');
  });

  it('completeBattle should exit fullscreen and clear countdown', async () => {
    component.currentUserExitedFullScreen = true;
    const exitMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', { value: true, configurable: true });
    Object.defineProperty(document, 'exitFullscreen', { value: exitMock, configurable: true });

    component.completeBattle('reason');

    expect(exitMock).toHaveBeenCalled();
    // countdown cleared
    expect(component.countdownId).toBeUndefined();
  });

  it('redirectToBattleResult should show info and navigate', fakeAsync(() => {
    const cleanupSpy = jest.spyOn(battleHubService, 'cleanupBattleSubjects');
    component['redirectToBattleResult']();
    tick(3000);
    expect(snackbar.showInfo).toHaveBeenCalledWith(platformMessages.battleComplted);
    expect(router.navigate).toHaveBeenCalledWith([
      Navigations.User,
      Navigations.Battles,
      Navigations.BattleList,
    ]);
    expect(cleanupSpy).toHaveBeenCalled();
  }));

  it('connectHub should not call connect if already connected', async () => {
    battleHubService.connected = true;
    const registerSpy = jest
      .spyOn(component as any, 'registerHubEvents')
      .mockImplementation(jest.fn());
    await (component as any).connectHub();
    expect(battleHubService.connect).not.toHaveBeenCalled();
    expect(registerSpy).toHaveBeenCalled();
  });

  it('registerHubEvents should handle onBattleStarted', () => {
    const startSpy = jest
      .spyOn(component as any, 'startCountdownTimer')
      .mockImplementation(jest.fn());
    battleHubService.onBattleStarted.next({ battleAttemptId: 99 } as any);
    (component as any).registerHubEvents();
    battleHubService.onBattleStarted.next({ battleAttemptId: 99 } as any);
    expect(component.decodedId).toBe(99);
    expect(startSpy).toHaveBeenCalled();
  });

  it('registerHubEvents should show info when opponent interrupted', () => {
    battleHubService.onPlayerInterrupted.next({ userId: 2 });
    (component as any).registerHubEvents();
    battleHubService.onPlayerInterrupted.next({ userId: 2 });
    expect(snackbar.showInfo).toHaveBeenCalledWith(platformMessages.opponentLeft);
  });

  it('registerHubEvents should show info when opponent battle ended', fakeAsync(() => {
    battleHubService.onBattleEndedForParticularPlayer.next({ userId: 2 });
    (component as any).registerHubEvents();
    battleHubService.onBattleEndedForParticularPlayer.next({ userId: 2 });
    tick(1500);
    expect(snackbar.showInfo).toHaveBeenCalledWith(platformMessages.opponentBattleEnded);
  }));

  it('beforeUnloadHandler should call saveBattleId', () => {
    component.attemptedId = 77;
    (component as any).beforeUnloadHandler();
    expect(saveBattleId).toHaveBeenCalledWith(77);
  });

  it('pageShowHandler should call showResumeDialog', () => {
    const showSpy = jest.spyOn(component as any, 'showResumeDialog').mockImplementation(jest.fn());
    (component as any).pageShowHandler();
    expect(showSpy).toHaveBeenCalled();
  });

  // Add these additional test cases to your existing describe block

  it('should handle cheat violation subscription', fakeAsync(() => {
    const handleViolationSpy = jest.spyOn<any, any>(component as any, 'handleViolation');

    component.ngOnInit();
    fixture.detectChanges();

    cheatPrevention.violations$.next('tab-switch');
    tick();

    expect(handleViolationSpy).toHaveBeenCalledWith('tab-switch');
  }));

  it('decodeRouteId should return early if no encodedId', () => {
    (route.snapshot.paramMap.get as jest.Mock).mockReturnValue(null);
    const getBattleSpy = jest.spyOn(component, 'getBattleInfo');

    component.decodeRouteId();

    expect(getBattleSpy).not.toHaveBeenCalled();
  });

  it('decodeRouteId should show error if hubBattleId is not available', () => {
    const encoded = btoa('123');
    (route.snapshot.paramMap.get as jest.Mock).mockReturnValue(encodeURIComponent(encoded));
    battleHubService.getCurrentBattleAttemptId.mockReturnValue(null);

    component.decodeRouteId();

    expect(snackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.invalidBattleId,
    );
  });

  it('decodeRouteId should handle non-numeric base64 decoded value', () => {
    const encoded = btoa('notanumber');
    (route.snapshot.paramMap.get as jest.Mock).mockReturnValue(encodeURIComponent(encoded));

    component.decodeRouteId();

    expect(component.decodedId).toBe(0);
    expect(snackbar.showError).toHaveBeenCalledWith(platformMessages.invalidBattleId);
  });

  it('resumeBattleInstruction should connect hub before resuming', () => {
    (getSavedBattleId as jest.Mock).mockReturnValue(42);
    const connectSpy = jest.spyOn<any, any>(component as any, 'connectHub');
    jest.spyOn(component, 'navigateToBattle').mockImplementation(jest.fn());

    component.resumeBattleInstruction();

    expect(connectSpy).toHaveBeenCalled();
  });

  it('resumeBattleInstruction should set battle_start_type in sessionStorage', () => {
    (getSavedBattleId as jest.Mock).mockReturnValue(42);
    jest.spyOn(component, 'navigateToBattle').mockImplementation(jest.fn());

    component.resumeBattleInstruction();

    expect(sessionStorage.getItem('battle_start_type')).toBe('reload');
  });

  it('navigateToBattle should encode attemptId and navigate with state', () => {
    const historyState = { battleId: 999 };
    Object.defineProperty(window, 'history', {
      writable: true,
      value: { state: historyState },
    });

    component.navigateToBattle(123);

    const encodedId = btoa('123');
    expect(router.navigate).toHaveBeenCalledWith(
      [Navigations.User, Navigations.Battles, Navigations.BattleAttempt, encodedId],
      { state: { battleId: 999 } },
    );
  });

  it('getBattleCategoryTagConfig should return default category if no instructions', () => {
    component.battleInstructions = undefined as any;
    const config = component.getBattleCategoryTagConfig();

    expect(config.label).toBe('category');
    expect(config.id).toBe('category');
    expect(config.type).toBe('static');
    expect(config.backgroundColor).toBe('white');
    expect(config.textColor).toBe('black');
  });

  it('openConfirmationDialog should call onConfirm when confirmed', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.openConfirmationDialog(
      { title: 'Test', message: 'Message' } as any,
      onConfirm,
      onCancel,
    );

    expect(onConfirm).toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('openConfirmationDialog should call onCancel when cancelled', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    dialog.open.mockReturnValue({ afterClosed: () => of(false) });

    component.openConfirmationDialog(
      { title: 'Test', message: 'Message' } as any,
      onConfirm,
      onCancel,
    );

    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('completeBattle should not exit fullscreen if currentUserExitedFullScreen is false', () => {
    component.currentUserExitedFullScreen = false;
    const clearSpy = jest.spyOn<any, any>(component as any, 'clearCountdown');

    component.completeBattle('reason');

    expect(clearSpy).not.toHaveBeenCalled();
    expect(snackbar.showError).not.toHaveBeenCalled();
  });

  it('completeBattle should handle webkitExitFullscreen', () => {
    component.currentUserExitedFullScreen = true;
    const webkitExitMock = jest.fn().mockResolvedValue(undefined);

    Object.defineProperty(document, 'fullscreenElement', { value: true, configurable: true });
    Object.defineProperty(document, 'exitFullscreen', { value: undefined, configurable: true });
    Object.defineProperty(document, 'webkitExitFullscreen', {
      value: webkitExitMock,
      configurable: true,
    });

    component.completeBattle('reason');

    expect(webkitExitMock).toHaveBeenCalled();
  });

  it('completeBattle should handle msExitFullscreen', () => {
    component.currentUserExitedFullScreen = true;
    const msExitMock = jest.fn();

    Object.defineProperty(document, 'fullscreenElement', { value: true, configurable: true });
    Object.defineProperty(document, 'exitFullscreen', { value: undefined, configurable: true });
    Object.defineProperty(document, 'webkitExitFullscreen', {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(document, 'msExitFullscreen', { value: msExitMock, configurable: true });

    component.completeBattle('reason');

    expect(msExitMock).toHaveBeenCalled();
  });

  it('completeBattle should handle exitFullscreen error', async () => {
    component.currentUserExitedFullScreen = true;
    const exitMock = jest.fn().mockRejectedValue(new Error('Exit failed'));

    Object.defineProperty(document, 'fullscreenElement', { value: true, configurable: true });
    Object.defineProperty(document, 'exitFullscreen', { value: exitMock, configurable: true });

    component.completeBattle('reason');

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(exitMock).toHaveBeenCalled();
  });

  it('clearCountdown should clear interval and set countdownId to undefined', () => {
    component.countdownId = setInterval(() => {}, 1000) as any;

    (component as any).clearCountdown();

    expect(component.countdownId).toBeUndefined();
  });

  it('clearCountdown should do nothing if countdownId is undefined', () => {
    component.countdownId = undefined;

    expect(() => (component as any).clearCountdown()).not.toThrow();
  });

  it('startCountdownTimer should clear existing countdown before starting new one', fakeAsync(() => {
    const clearSpy = jest.spyOn<any, any>(component as any, 'clearCountdown');

    (component as any).startCountdownTimer();

    expect(clearSpy).toHaveBeenCalled();

    tick((component.countdownSeconds + 1) * 1000);
  }));

  it('startCountdownTimer should not navigate if decodedId is not set', fakeAsync(() => {
    component.decodedId = 0;
    const navigateSpy = jest.spyOn(component, 'navigateToBattle');

    (component as any).startCountdownTimer();
    tick((component.countdownSeconds + 1) * 1000);

    expect(navigateSpy).not.toHaveBeenCalled();
  }));

  it('registerHubEvents should not show info when current user is interrupted', () => {
    authService.getCurrentUserId.mockReturnValue('1');

    (component as any).registerHubEvents();
    battleHubService.onPlayerInterrupted.next({ userId: 1 });

    expect(snackbar.showInfo).not.toHaveBeenCalledWith(platformMessages.opponentLeft);
  });

  it('registerHubEvents should not show info when current user battle ends', fakeAsync(() => {
    authService.getCurrentUserId.mockReturnValue('1');

    (component as any).registerHubEvents();
    battleHubService.onBattleEndedForParticularPlayer.next({ userId: 1 });
    tick(1500);

    expect(snackbar.showInfo).not.toHaveBeenCalledWith(platformMessages.opponentBattleEnded);
  }));

  it('handleViolation should not call interruptBattle if attemptedId is not set', () => {
    component.attemptedId = 0;
    const completeSpy = jest.spyOn(component, 'completeBattle').mockImplementation(jest.fn());

    (component as any).handleViolation('reason');

    expect(battleHubService.interruptBattle).not.toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalledWith('reason');
  });

  it('showResumeDialog should open confirmation dialog with correct config', () => {
    const resumeSpy = jest
      .spyOn(component, 'resumeBattleInstruction')
      .mockImplementation(jest.fn());

    (component as any).showResumeDialog();

    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        width: '600px',
        disableClose: true,
      }),
    );
    expect(resumeSpy).toHaveBeenCalled();
  });

  it('should handle getBattleInfo with null data', () => {
    battleService.getBattleInstruction.mockReturnValue(of({ result: true, data: null }));

    component.getBattleInfo(1);

    expect(snackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  });

  it('should handle getBattleInfo error without error message', () => {
    const error = { error: {} };
    battleService.getBattleInstruction.mockReturnValue({
      subscribe: ({ error: errFn }: any) => errFn(error),
    } as any);

    component.getBattleInfo(1);

    expect(snackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  });

  it('ngOnDestroy should call next and complete on destroy$', () => {
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('countdown should decrement countdownSeconds correctly', fakeAsync(() => {
    const initialSeconds = component.countdownSeconds;

    (component as any).startCountdownTimer();
    tick(2000);

    expect(component.countdownSeconds).toBe(initialSeconds - 2);

    tick((component.countdownSeconds + 1) * 1000);
  }));

  it('completeBattle should call redirectToBattleResult', fakeAsync(() => {
    component.currentUserExitedFullScreen = true;
    const redirectSpy = jest.spyOn<any, any>(component as any, 'redirectToBattleResult');

    component.completeBattle('reason');

    expect(redirectSpy).toHaveBeenCalled();
  }));

  it('should handle exitFullscreen when no fullscreen element', () => {
    component.currentUserExitedFullScreen = true;
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });

    expect(() => component.completeBattle('reason')).not.toThrow();
  });

  it('resumeBattleInstruction should use getSavedBattleId when attemptedId is not set', () => {
    (getSavedBattleId as jest.Mock).mockReturnValue(100);
    component.attemptedId = 0;
    jest.spyOn(component, 'navigateToBattle').mockImplementation(jest.fn());

    component.resumeBattleInstruction();

    expect(component.attemptedId).toBe(100);
  });

  it('startCountdownTimer should show battleStart message when navigating', fakeAsync(() => {
    component.decodedId = 123;
    jest.spyOn(component, 'navigateToBattle').mockImplementation(jest.fn());

    (component as any).startCountdownTimer();
    tick((component.countdownSeconds + 1) * 1000);

    expect(snackbar.showInfo).toHaveBeenCalledWith(platformMessages.battleStart);
  }));
});
