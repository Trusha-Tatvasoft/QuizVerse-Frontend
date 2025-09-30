import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { BattleAttemptLayoutComponent } from './battle-attempt-layout.component';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { CheatPreventionService } from '../../../shared/service/cheat-prevention/cheat-prevention.service';
import { BattleHubService } from '../../../services/user/user-battles/battle-hub.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { platformMessages } from '../../../utils/constants';
import * as helpers from '../battle-attempt-layout/battle-atttempt.helper';
describe('BattleAttemptLayoutComponent', () => {
  let component: BattleAttemptLayoutComponent;
  let fixture: ComponentFixture<BattleAttemptLayoutComponent>;

  const snackbarSpy = {
    showError: jest.fn(),
    showInfo: jest.fn(),
    showSuccess: jest.fn(),
  };

  const cheatSpy = {
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    violations$: new Subject<string>(),
  };

  const routerSpy = {
    navigate: jest.fn(),
  };

  const dialogSpy = { open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }) };
  const authSpy = { getCurrentUserId: jest.fn().mockReturnValue('42') };

  let hubSpy: any;

  const activatedRouteMock = {
    snapshot: { paramMap: { get: jest.fn().mockReturnValue('MTIz') } },
    params: of({ id: 'MTIz' }),
  };

  beforeEach(async () => {
    // Reset hubSpy for each test
    hubSpy = {
      connected: false,
      connect: jest.fn().mockResolvedValue(undefined),
      cleanupBattleSubjects: jest.fn(),
      resumeBattle: jest.fn(),
      submitAnswer: jest.fn(),
      interruptBattle: jest.fn(),
      getCurrentBattleAttemptId: jest.fn().mockReturnValue(111),
      onBattleStarted: new Subject<any>(),
      onBattleResumed: new Subject<any>(),
      onQuestion: new Subject<any>(),
      onScoreUpdate: new Subject<any>(),
      lastAnsweredDetail: new Subject<any>(),
      onPlayerInterrupted: new Subject<any>(),
      onBattleEndedForParticularPlayer: new Subject<any>(),
    };

    // Mock history.state
    Object.defineProperty(window, 'history', {
      writable: true,
      value: {
        state: { battleId: 123 },
        pushState: jest.fn(),
        replaceState: jest.fn(),
      },
    });

    await TestBed.configureTestingModule({
      imports: [BattleAttemptLayoutComponent],
      providers: [
        { provide: SnackbarService, useValue: snackbarSpy },
        { provide: CheatPreventionService, useValue: cheatSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: BattleHubService, useValue: hubSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleAttemptLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('should create and start cheat monitoring on init', () => {
    expect(component).toBeTruthy();
    expect(cheatSpy.startMonitoring).toHaveBeenCalled();
  });

  it('decodeRouteId should decode base64 param to number', () => {
    component.decodeRouteId();
    expect(component.decodedId).toBe(123);
  });

  it('progressBarPercentage should compute correctly', () => {
    component.totalQuestion = 10;
    component.currentQuestionIndex = 5;
    expect(component.progressBarPercentage).toBe(50);
  });

  it('formattedQuestionTime should return mm:ss', () => {
    component.remainingSeconds = 65;
    component.questions = [{} as any];
    expect(component.formattedQuestionTime).toBe('1:05');
  });

  it('startQuestionTimer should decrement remainingSeconds and call handleLocalTimeout', fakeAsync(() => {
    const spy = jest.spyOn<any, any>(component as any, 'handleLocalTimeout');
    component.startQuestionTimer(1);
    expect(component.remainingSeconds).toBe(1);
    tick(1000);
    expect(component.remainingSeconds).toBe(0);
    expect(spy).toHaveBeenCalled();
    component.clearQuestionTimer();
  }));

  it('clearQuestionTimer should clear interval/timeout', fakeAsync(() => {
    const intId = window.setInterval(() => {}, 1000);
    const timeoutId = window.setTimeout(() => {}, 1000);
    component.questionTimerId = intId;
    component.questionDelayId = timeoutId;
    component.clearQuestionTimer();
    tick();
    expect(component.questionTimerId).toBeUndefined();
    expect(component.questionDelayId).toBeUndefined();
  }));

  it('submitAnswer should call hub service', () => {
    component.attemptedId = 77;
    component.currentQuestionIndex = 2;
    component.totalQuestion = 5;
    component.submitAnswer('A');
    expect(hubSpy.submitAnswer).toHaveBeenCalledWith(77, 2, 'A');
  });

  it('resumeBattle should connect hub and call resumeBattle when attemptedId is set', async () => {
    component.attemptedId = 55;
    await component.resumeBattle();
    expect(hubSpy.connect).toHaveBeenCalled();
  });

  it('openConfirmationDialog should trigger onConfirm callback', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    component.openConfirmationDialog({ title: 'T', message: 'M' } as any, onConfirm, onCancel);
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalled();
  });

  it('ngOnDestroy should clean up subscriptions and timers', () => {
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
    expect(cheatSpy.stopMonitoring).toHaveBeenCalled();
    expect(hubSpy.cleanupBattleSubjects).toHaveBeenCalled();
  });

  it('should handle hub onQuestion event and start timer', fakeAsync(() => {
    hubSpy.onQuestion.next({
      questionIndex: 1,
      quizQuestionId: 100,
      questionName: 'What is 2+2?',
      questionType: 'multiple-choice',
      options: [{ key: 'A', value: '4' }],
      timeInSeconds: 1,
    });
    tick(0);
    expect(component.questions.length).toBe(1);
    expect(component.currentQuestionIndex).toBe(1);
  }));

  it('should handle lastAnsweredDetail and show correct answer', fakeAsync(() => {
    hubSpy.lastAnsweredDetail.next({ correctAnswer: 'B', isCorrect: true });
    expect(component.correctAnswer).toBe('B');
    expect(component.showCorrectAnswer).toBe(true);
    tick(3000);
    expect(component.showCorrectAnswer).toBe(false);
  }));

  it('handleViolation should call interruptBattle and completeBattle', () => {
    const completeSpy = jest.spyOn(component, 'completeBattle');
    component.attemptedId = 42;
    (component as any).handleViolation('cheat');
    expect(hubSpy.interruptBattle).toHaveBeenCalledWith(42);
    expect(component.currentUserExitedFullScreen).toBe(true);
    expect(completeSpy).toHaveBeenCalledWith('cheat');
  });

  it('pageShowHandler should resume battle if savedAttemptId exists', async () => {
    jest.spyOn(helpers, 'getSavedBattleId').mockReturnValue(77);
    hubSpy.connected = true;
    const snackbarInfoSpy = jest.spyOn(snackbarSpy, 'showInfo');
    await (component as any).pageShowHandler();
    expect(hubSpy.resumeBattle).toHaveBeenCalledWith(77);
    expect(snackbarInfoSpy).toHaveBeenCalledWith(platformMessages.battleResumeSuccess);
  });

  it('pageShowHandler should connect and resume if hub not connected', async () => {
    jest.spyOn(helpers, 'getSavedBattleId').mockReturnValue(88);
    hubSpy.connected = false;
    const connectSpy = jest.spyOn(hubSpy, 'connect');
    await (component as any).pageShowHandler();
    expect(connectSpy).toHaveBeenCalled();
    expect(hubSpy.resumeBattle).toHaveBeenCalledWith(88);
  });

  it('pageShowHandler should handle error during resume', async () => {
    jest.spyOn(helpers, 'getSavedBattleId').mockReturnValue(99);
    hubSpy.connected = true;
    hubSpy.resumeBattle = jest.fn().mockImplementation(() => {
      throw new Error();
    });
    const errorSpy = jest.spyOn(snackbarSpy, 'showError');
    await (component as any).pageShowHandler();
    expect(errorSpy).toHaveBeenCalledWith(platformMessages.resumeBattleFailed);
  });

  it('handleBattleStart should assign players and saveBattleId', () => {
    jest.spyOn(helpers, 'saveBattleId').mockImplementation(jest.fn());

    const details = {
      battleAttemptId: 5,
      totalQuestions: 10,
      battleName: 'Test Battle',
      playerProfile: { userId: 1, name: 'Me' },
      opponentProfile: { userId: 2, name: 'Opponent' },
    } as any;

    component['handleBattleStart'](details);
    expect(component.attemptedId).toBe(5);
    expect(component.totalQuestion).toBe(10);
    expect(component.battleTag.label).toBe('Test Battle');
    expect(helpers.saveBattleId).toHaveBeenCalledWith(5);
  });

  it('onScoreUpdate hub event should set battleStatus and opponentTag', () => {
    component.mySide = 'player1';
    component.currentQuestionIndex = 1;
    component.myAccuracy = 0;
    hubSpy.onScoreUpdate.next({
      player1Score: 10,
      player2Score: 5,
      player1CurrentIndex: 2,
      player2CurrentIndex: 1,
      player1CorrectedAns: 1,
      player2CorrectedAns: 0,
    });
    expect(component.battleStatus).toBe('leading');
    expect(component.opponentStatus).toBe('thinking');
  });

  it('onScoreUpdate hub event should set behind/tied correctly', () => {
    component.mySide = 'player1';
    hubSpy.onScoreUpdate.next({
      player1Score: 5,
      player2Score: 10,
      player1CurrentIndex: 1,
      player2CurrentIndex: 2,
      player1CorrectedAns: 0,
      player2CorrectedAns: 1,
    });
    expect(component.battleStatus).toBe('behind');
    expect(component.opponentStatus).toBe('answered');
  });

  // Add these test cases to your existing describe block

  it('should handle battle started event and show snackbar', fakeAsync(() => {
    const snackbarInfoSpy = jest.spyOn(snackbarSpy, 'showInfo');

    const details = {
      battleAttemptId: 5,
      totalQuestions: 10,
      battleName: 'Test Battle',
      playerProfile: { userId: 1, name: 'Me', imageUrl: 'url1' },
      opponentProfile: { userId: 2, name: 'Opponent', imageUrl: 'url2' },
    } as any;

    hubSpy.onBattleStarted.next(details);
    tick();

    expect(snackbarInfoSpy).toHaveBeenCalledWith(platformMessages.battleStart);
  }));

  it('should handle battle resumed event and show success snackbar', fakeAsync(() => {
    const snackbarSuccessSpy = jest.spyOn(snackbarSpy, 'showSuccess');

    const details = {
      battleAttemptId: 6,
      totalQuestions: 8,
      battleName: 'Resumed Battle',
      playerProfile: { userId: 1, name: 'Me', imageUrl: 'url1' },
      opponentProfile: { userId: 2, name: 'Opponent', imageUrl: 'url2' },
    } as any;

    hubSpy.onBattleResumed.next(details);
    tick();

    expect(snackbarSuccessSpy).toHaveBeenCalledWith('Battle resumed successfully!');
  }));

  it('should handle question event error and show error snackbar', () => {
    const errorSpy = jest.spyOn(snackbarSpy, 'showError');
    hubSpy.onQuestion.error(new Error('Failed to load question'));
    expect(errorSpy).toHaveBeenCalledWith(platformMessages.questionLoadFail);
  });

  it('should handle opponent interrupted event', fakeAsync(() => {
    const snackbarInfoSpy = jest.spyOn(snackbarSpy, 'showInfo');
    authSpy.getCurrentUserId.mockReturnValue('1');

    hubSpy.onPlayerInterrupted.next({ userId: 2 });
    tick();

    expect(snackbarInfoSpy).toHaveBeenCalledWith(platformMessages.opponentLeft);
  }));

  it('should not show message when current user is interrupted', fakeAsync(() => {
    const snackbarInfoSpy = jest.spyOn(snackbarSpy, 'showInfo');
    authSpy.getCurrentUserId.mockReturnValue('1');

    hubSpy.onPlayerInterrupted.next({ userId: 1 });
    tick();

    expect(snackbarInfoSpy).not.toHaveBeenCalledWith(platformMessages.opponentLeft);
  }));

  it('should handle battle ended for opponent', fakeAsync(() => {
    const snackbarInfoSpy = jest.spyOn(snackbarSpy, 'showInfo');
    authSpy.getCurrentUserId.mockReturnValue('1');

    hubSpy.onBattleEndedForParticularPlayer.next({ userId: 2 });
    tick(1500);

    expect(snackbarInfoSpy).toHaveBeenCalledWith(platformMessages.opponentBattleEnded);
  }));

  it('should not show message when current user battle ends', fakeAsync(() => {
    const snackbarInfoSpy = jest.spyOn(snackbarSpy, 'showInfo');
    authSpy.getCurrentUserId.mockReturnValue('1');

    hubSpy.onBattleEndedForParticularPlayer.next({ userId: 1 });
    tick(1500);

    expect(snackbarInfoSpy).not.toHaveBeenCalledWith(platformMessages.opponentBattleEnded);
  }));

  it('should handle cheat violation subscription', fakeAsync(() => {
    component.attemptedId = 42;
    component.currentUserExitedFullScreen = false;
    const violationSpy = jest.spyOn<any, any>(component as any, 'handleViolation');

    cheatSpy.violations$.next('tab-switch');
    tick();

    expect(violationSpy).toHaveBeenCalledWith('tab-switch');
  }));

  it('completeBattle should exit fullscreen and redirect', fakeAsync(() => {
    component.currentUserExitedFullScreen = true;
    component.attemptedId = 42;
    const errorSpy = jest.spyOn(snackbarSpy, 'showError');
    const clearTimerSpy = jest.spyOn(component, 'clearQuestionTimer');

    component.completeBattle('violation');

    expect(errorSpy).toHaveBeenCalled();
    expect(clearTimerSpy).toHaveBeenCalled();
    tick(3000);
    expect(routerSpy.navigate).toHaveBeenCalled();
  }));

  it('submitAnswer should connect hub if not connected', () => {
    hubSpy.connected = false;
    component.attemptedId = 77;
    component.currentQuestionIndex = 2;
    component.totalQuestion = 5;

    component.submitAnswer('B');

    expect(hubSpy.connect).toHaveBeenCalled();
    expect(component.selectedAnswer).toBe('B');
  });

  it('submitAnswer should redirect to result when last question', fakeAsync(() => {
    component.attemptedId = 77;
    component.currentQuestionIndex = 5;
    component.totalQuestion = 5;

    component.submitAnswer('C');
    tick(3000);

    expect(hubSpy.submitAnswer).toHaveBeenCalledWith(77, 5, 'C');
    expect(routerSpy.navigate).toHaveBeenCalled();
  }));

  it('should handle decodeRouteId with invalid base64', () => {
    const errorSpy = jest.spyOn(snackbarSpy, 'showError');
    activatedRouteMock.snapshot.paramMap.get = jest.fn().mockReturnValue('invalid!!!');

    component.decodeRouteId();

    expect(errorSpy).toHaveBeenCalledWith(platformMessages.invalidBattleId);
    expect(component.decodedId).toBe(0);
  });

  it('should handle decodeRouteId with non-numeric result', () => {
    const errorSpy = jest.spyOn(snackbarSpy, 'showError');
    const invalidBase64 = btoa('notanumber');
    activatedRouteMock.snapshot.paramMap.get = jest.fn().mockReturnValue(invalidBase64);

    component.decodeRouteId();

    expect(component.decodedId).toBe(0);
  });

  it('should return 0 progress when totalQuestion is 0', () => {
    component.totalQuestion = 0;
    component.currentQuestionIndex = 5;

    expect(component.progressBarPercentage).toBe(0);
  });

  it('should return 0:00 when no questions exist', () => {
    component.questions = [];
    component.remainingSeconds = 65;

    expect(component.formattedQuestionTime).toBe('0:00');
  });

  it('should return 0:00 when remainingSeconds is 0 or less', () => {
    component.questions = [{} as any];
    component.remainingSeconds = 0;

    expect(component.formattedQuestionTime).toBe('0:00');
  });

  it('handleLocalTimeout should show info and redirect on last question', fakeAsync(() => {
    const snackbarInfoSpy = jest.spyOn(snackbarSpy, 'showInfo');
    component.questions = [{} as any];
    component.currentQuestionIndex = 5;
    component.totalQuestion = 5;
    component.attemptedId = 42;

    (component as any).handleLocalTimeout();

    expect(snackbarInfoSpy).toHaveBeenCalledWith(platformMessages.timeoutNextQuestion);
    tick(3000);
    expect(routerSpy.navigate).toHaveBeenCalled();
  }));

  it('handleLocalTimeout should do nothing when no questions', async () => {
    component.questions = [];
    const snackbarInfoSpy = jest.spyOn(snackbarSpy, 'showInfo');

    await (component as any).handleLocalTimeout();

    expect(snackbarInfoSpy).not.toHaveBeenCalled();
  });

  it('beforeUnloadHandler should save battle id', () => {
    const saveSpy = jest.spyOn(helpers, 'saveBattleId');
    component.attemptedId = 99;

    (component as any).beforeUnloadHandler();

    expect(saveSpy).toHaveBeenCalledWith(99);
  });

  it('should handle onScoreUpdate for player2 perspective', () => {
    component.mySide = 'player2';
    component.currentQuestionIndex = 1;

    hubSpy.onScoreUpdate.next({
      player1Score: 10,
      player2Score: 15,
      player1CurrentIndex: 2,
      player2CurrentIndex: 3,
      player1CorrectedAns: 1,
      player2CorrectedAns: 2,
    });

    expect(component.me.score).toBe(15);
    expect(component.opponent.score).toBe(10);
    expect(component.battleStatus).toBe('leading');
    expect(component.myAccuracy).toBe(2);
  });

  it('should update opponent tag when opponent status changes', () => {
    component.mySide = 'player1';
    component.opponentStatus = 'thinking';

    hubSpy.onScoreUpdate.next({
      player1Score: 5,
      player2Score: 10,
      player1CurrentIndex: 1,
      player2CurrentIndex: 2,
      player1CorrectedAns: 0,
      player2CorrectedAns: 1,
    });

    expect(component.opponentStatus).toBe('answered');
  });

  it('should not update opponent tag when opponent status unchanged', () => {
    component.mySide = 'player1';
    component.opponentStatus = 'thinking';
    const initialTag = component.opponentTag;

    hubSpy.onScoreUpdate.next({
      player1Score: 5,
      player2Score: 10,
      player1CurrentIndex: 2,
      player2CurrentIndex: 1,
      player1CorrectedAns: 0,
      player2CorrectedAns: 1,
    });

    expect(component.opponentStatus).toBe('thinking');
  });

  it('resumeBattle should show error if no attemptedId', () => {
    jest.spyOn(helpers, 'getSavedBattleId').mockReturnValue(null);
    const errorSpy = jest.spyOn(snackbarSpy, 'showError');
    component.attemptedId = undefined as any;

    component.resumeBattle();

    expect(errorSpy).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.resumeBattleFailed,
    );
  });

  it('openConfirmationDialog should call onCancel when dialog returns false', () => {
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    component.openConfirmationDialog({ title: 'T', message: 'M' } as any, onConfirm, onCancel);

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should handle question with missing options', fakeAsync(() => {
    component.questions = [];

    hubSpy.onQuestion.next({
      questionIndex: 1,
      quizQuestionId: 100,
      questionName: 'What is 2+2?',
      questionType: 'multiple-choice',
      options: undefined,
      timeInSeconds: 30,
    } as any);

    tick();

    expect(component.questions.length).toBe(1);
    expect(component.questions[0].options).toEqual([]);
  }));

  it('should handle question with missing timeInSeconds', fakeAsync(() => {
    component.questions = [];

    hubSpy.onQuestion.next({
      questionIndex: 1,
      quizQuestionId: 100,
      questionName: 'What is 2+2?',
      questionType: 'multiple-choice',
      options: [{ key: 'A', value: '4' }],
      timeInSeconds: undefined,
    } as any);

    tick();

    expect(component.questions.length).toBe(1);
    expect(component.questions[0].timeInSeconds).toBe(60);
  }));

  it('should assign player1 as me when mySide is player1', () => {
    authSpy.getCurrentUserId.mockReturnValue('1');
    jest.spyOn(helpers, 'saveBattleId').mockImplementation(jest.fn());

    const details = {
      battleAttemptId: 5,
      totalQuestions: 10,
      battleName: 'Test Battle',
      playerProfile: { userId: 1, name: 'Player1', imageUrl: 'url1' },
      opponentProfile: { userId: 2, name: 'Player2', imageUrl: 'url2' },
    } as any;

    jest.spyOn(helpers.BattlePlayerHelper, 'resolvePlayers').mockReturnValue({
      mySide: 'player1',
      player1: { id: 1, name: 'Player1', imageUrl: 'url1', score: 0 },
      player2: { id: 2, name: 'Player2', imageUrl: 'url2', score: 0 },
    });

    component['handleBattleStart'](details);

    expect(component.me.id).toBe(1);
    expect(component.opponent.id).toBe(2);
  });

  it('should assign player2 as me when mySide is player2', () => {
    authSpy.getCurrentUserId.mockReturnValue('2');
    jest.spyOn(helpers, 'saveBattleId').mockImplementation(jest.fn());

    const details = {
      battleAttemptId: 5,
      totalQuestions: 10,
      battleName: 'Test Battle',
      playerProfile: { userId: 1, name: 'Player1', imageUrl: 'url1' },
      opponentProfile: { userId: 2, name: 'Player2', imageUrl: 'url2' },
    } as any;

    jest.spyOn(helpers.BattlePlayerHelper, 'resolvePlayers').mockReturnValue({
      mySide: 'player2',
      player1: { id: 1, name: 'Player1', imageUrl: 'url1', score: 0 },
      player2: { id: 2, name: 'Player2', imageUrl: 'url2', score: 0 },
    });

    component['handleBattleStart'](details);

    expect(component.me.id).toBe(2);
    expect(component.opponent.id).toBe(1);
  });

  it('should handle ngOnInit with battle_start_type as reload', () => {
    // Create a fresh component for this test
    sessionStorage.setItem('battle_start_type', 'reload');
    jest.spyOn(helpers, 'getSavedBattleId').mockReturnValue(123);

    const newFixture = TestBed.createComponent(BattleAttemptLayoutComponent);
    const newComponent = newFixture.componentInstance;

    newComponent.ngOnInit();

    expect(hubSpy.resumeBattle).toHaveBeenCalledWith(123);
    expect(sessionStorage.getItem('battle_start_type')).toBeNull();

    newFixture.destroy();
  });

  it('connectHub should connect if not connected and subscribe events', async () => {
    hubSpy.connected = false;
    const subscribeSpy = jest.spyOn<any, any>(component as any, 'subscribeHubEvents');

    await (component as any).connectHub();

    expect(hubSpy.connect).toHaveBeenCalled();
    expect(subscribeSpy).toHaveBeenCalled();
  });

  it('connectHub should only subscribe events if already connected', async () => {
    hubSpy.connected = true;
    const subscribeSpy = jest.spyOn<any, any>(component as any, 'subscribeHubEvents');
    const connectCallCount = hubSpy.connect.mock.calls.length;

    await (component as any).connectHub();

    expect(hubSpy.connect.mock.calls.length).toBe(connectCallCount); // No new calls
    expect(subscribeSpy).toHaveBeenCalled();
  });

  it('showResumeDialog should call resumeBattle on confirm', () => {
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    const resumeSpy = jest.spyOn(component, 'resumeBattle');

    (component as any).showResumeDialog();

    expect(resumeSpy).toHaveBeenCalled();
  });

  it('showResumeDialog should call handleViolation on cancel', () => {
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    const violationSpy = jest.spyOn<any, any>(component as any, 'handleViolation');

    (component as any).showResumeDialog();

    expect(violationSpy).toHaveBeenCalledWith(platformMessages.resumeBattleFailed);
  });

  it('buildBattleTag should create correct tag config', () => {
    const details = {
      battleAttemptId: 7,
      battleName: 'Epic Battle',
    } as any;

    const tag = (component as any).buildBattleTag(details);

    expect(tag.id).toBe('battle-7');
    expect(tag.label).toBe('Epic Battle');
    expect(tag.type).toBe('static');
    expect(tag.backgroundColor).toBe('lightPurple');
  });

  it('buildBattleTag should handle missing battleName', () => {
    const details = {
      battleAttemptId: 8,
    } as any;

    const tag = (component as any).buildBattleTag(details);

    expect(tag.label).toBe('Battle');
  });

  it('subscribeHubEvents should use saved battle id if available', () => {
    jest.spyOn(helpers, 'getSavedBattleId').mockReturnValue(555);

    (component as any).subscribeHubEvents();

    expect(component.attemptedId).toBe(555);
  });
});
