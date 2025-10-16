import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AvailableBattlesComponent } from './available-battles.component';
import { UserBattlesService } from '../../../../services/user/user-battles/user-battles.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { of, Subject, throwError } from 'rxjs';
import {
  AvailableBattle,
  UserAvailableBattlesResponseDto,
} from '../interface/quiz-battles.interface';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';
import { MatDialog } from '@angular/material/dialog';
import { ChallengeFriendComponent } from './components/challenge-friend/challenge-friend.component';

describe('AvailableBattlesComponent', () => {
  let component: AvailableBattlesComponent;
  let fixture: ComponentFixture<AvailableBattlesComponent>;
  let mockUserBattlesService: any;
  let mockRouter: any;
  let mockSnackbarService: any;
  let dialogMock: { open: jest.Mock };

  const mockBattles: AvailableBattle[] = [
    {
      battleId: 1,
      battleName: 'Battle 1',
      category: 'Math',
      description: 'Description 1',
      difficulty: 'Easy',
      maxXP: 100,
      totalQuestions: 10,
      duration: '10 mins',
      participants: 5,
      isBattleRunning: 0,
    },
    {
      battleId: 2,
      battleName: 'Battle 2',
      category: 'Science',
      description: 'Description 2',
      difficulty: 'Medium',
      maxXP: 200,
      totalQuestions: 20,
      duration: '20 mins',
      participants: 10,
      isBattleRunning: 0,
    },
  ];

  const mockApiResponse: UserAvailableBattlesResponseDto = {
    battles: mockBattles,
    hasMore: false,
  };

  beforeEach(async () => {
    const updateBattleResultsSubject = new Subject<boolean>();

    mockUserBattlesService = {
      getUserAvailableBattles: jest.fn(),
      updateBattleResults$: updateBattleResultsSubject,
      updateBattleResultsObservable$: updateBattleResultsSubject.asObservable(),
    };
    mockRouter = { navigate: jest.fn() };
    mockSnackbarService = { showError: jest.fn(), showSuccess: jest.fn() };

    dialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [AvailableBattlesComponent],
      providers: [
        { provide: UserBattlesService, useValue: mockUserBattlesService },
        { provide: Router, useValue: mockRouter },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailableBattlesComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should populate battles on successful API call', () => {
    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      of({ result: true, data: mockApiResponse }),
    );

    component.ngOnInit();
    fixture.detectChanges();

    expect(mockUserBattlesService.getUserAvailableBattles).toHaveBeenCalledWith(1);
    expect(component.battles.length).toBe(2);
    expect(component.error).toBeNull();
    expect(component.hasMoreData).toBe(false);
  });

  it('should handle API error response', () => {
    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      of({ result: false, data: mockApiResponse, message: 'Failed to fetch' }),
    );

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.battles.length).toBe(0);
    expect(component.error).toBe('Failed to fetch');
  });

  it('should show snackbar on observable error', () => {
    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    component.ngOnInit();
    fixture.detectChanges();

    expect(mockSnackbarService.showError).toHaveBeenCalled();
  });

  it('should navigate to battle', () => {
    const battle: AvailableBattle & { difficultyTag: TagInputConfig } = {
      battleId: 123,
      battleName: 'Math Challenge',
      category: 'Math',
      difficulty: 'Hard',
      description: 'Test battle',
      maxXP: 100,
      totalQuestions: 10,
      duration: '10m',
      participants: 2,
      isBattleRunning: 0,
      difficultyTag: {
        id: 'hard',
        label: 'Hard',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'red',
        textColor: 'white',
      },
    };

    component.navigateToBattle(battle);

    const encodedId = btoa(battle.battleId.toString());
    const battleData = {
      battleName: battle.battleName,
      battleCategory: battle.category,
      battleXp: battle.maxXP,
      battleDifficulty: battle.difficulty,
    };

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['user', 'battles', 'battle-list', 'search-opponent', encodedId],
      { state: { battleData } },
    );
  });

  it('should open the ChallengeFriendComponent with correct configuration', () => {
    const battle: AvailableBattle = {
      battleId: 1,
      battleName: 'Battle 1',
      category: 'Math',
      description: 'Description 1',
      difficulty: 'Easy',
      maxXP: 100,
      totalQuestions: 10,
      duration: '10 mins',
      participants: 5,
      isBattleRunning: 0,
    };

    dialogMock.open.mockReturnValue({
      afterClosed: () => of(null),
    });

    component.openChallengeFriendDialgue(battle);

    expect(dialogMock.open).toHaveBeenCalledWith(ChallengeFriendComponent, {
      width: '600px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      autoFocus: false,
      data: {
        battleId: battle.battleId,
        battleName: battle.battleName,
      },
    });
  });

  it('should call availableBattles() when dialog result is truthy', () => {
    const battle: AvailableBattle = {
      battleId: 2,
      battleName: 'Battle 2',
      category: 'Science',
      description: 'Description 2',
      difficulty: 'Medium',
      maxXP: 200,
      totalQuestions: 20,
      duration: '20 mins',
      participants: 10,
      isBattleRunning: 0,
    };

    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      of({
        result: true,
        data: mockApiResponse,
        message: 'Success',
      }),
    );

    dialogMock.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.openChallengeFriendDialgue(battle);

    expect(mockUserBattlesService.getUserAvailableBattles).toHaveBeenCalled();
  });

  it('should NOT call getUserAvailableBattles() when dialog result is falsy', () => {
    const battle: AvailableBattle = {
      battleId: 3,
      battleName: 'Battle 3',
      category: 'History',
      description: 'Description 3',
      difficulty: 'Hard',
      maxXP: 300,
      totalQuestions: 30,
      duration: '30 mins',
      participants: 8,
      isBattleRunning: 0,
    };

    const initialCallCount = mockUserBattlesService.getUserAvailableBattles.mock.calls.length;

    dialogMock.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.openChallengeFriendDialgue(battle);

    expect(mockUserBattlesService.getUserAvailableBattles.mock.calls.length).toBe(initialCallCount);
  });

  it('should call ngOnDestroy and complete destroy$', () => {
    const spyNext = jest.spyOn(component['destroy$'], 'next');
    const spyComplete = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(spyNext).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });

  it('should call availableBattles() again when updateBattleResults$ emits true', fakeAsync(() => {
    const availableBattlesSpy = jest
      .spyOn<any, any>(component as any, 'availableBattles')
      .mockImplementation(() => {});

    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      of({ result: true, data: mockBattles }),
    );

    fixture.detectChanges();
    expect(availableBattlesSpy).toHaveBeenCalledTimes(1);
    mockUserBattlesService.updateBattleResults$.next(true);
    tick(200);
    expect(availableBattlesSpy).toHaveBeenCalledTimes(1);
  }));

  it('should navigate to result page with encoded id', () => {
    const battleId = 10;
    const encodedId = btoa(battleId.toString());

    component.navigateToResult(battleId);

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      'user',
      'battles',
      'battle-list',
      'quiz-result',
      encodedId,
    ]);
  });

  it('should show snackbar and not navigate when dev tools are open', () => {
    jest.spyOn<any, any>(component as any, 'isDevToolsOpen').mockReturnValue(true);

    const battle: AvailableBattle & { difficultyTag: TagInputConfig } = {
      battleId: 111,
      battleName: 'Battle',
      category: 'Science',
      description: 'Desc',
      difficulty: 'Hard',
      maxXP: 50,
      totalQuestions: 5,
      duration: '5m',
      participants: 2,
      isBattleRunning: 0,
      difficultyTag: {
        id: 'id',
        label: 'Hard',
        type: 'static',
        isSelected: false,
        hasBorder: true,
        backgroundColor: 'red',
        textColor: 'white',
      },
    };

    component.navigateToBattle(battle);

    expect(mockSnackbarService.showError).toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should return true from isDevToolsOpen when thresholds exceeded', () => {
    const originalOuterWidth = window.outerWidth;
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'outerWidth', { value: 1000, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 700, configurable: true });

    const result = (component as any).isDevToolsOpen();
    expect(result).toBe(true);

    Object.defineProperty(window, 'outerWidth', { value: originalOuterWidth });
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth });
  });

  it('should return false from isDevToolsOpen when no thresholds exceeded', () => {
    const originalOuterWidth = window.outerWidth;
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'outerWidth', { value: 1000, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 900, configurable: true });

    const result = (component as any).isDevToolsOpen();
    expect(result).toBe(false);

    Object.defineProperty(window, 'outerWidth', { value: originalOuterWidth });
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth });
  });

  it('should append new battles to existing battles when batchNumber > 1', () => {
    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      of({ result: true, data: mockApiResponse }),
    );

    fixture.detectChanges();
    expect(component.battles.length).toBe(2);

    const newBattles: AvailableBattle[] = [
      {
        battleId: 3,
        battleName: 'Battle 3',
        category: 'History',
        description: 'Description 3',
        difficulty: 'Hard',
        maxXP: 300,
        totalQuestions: 30,
        duration: '30 mins',
        participants: 8,
        isBattleRunning: 0,
      },
    ];
    mockUserBattlesService.getUserAvailableBattles.mockReturnValueOnce(
      of({ result: true, data: { battles: newBattles, hasMore: true } }),
    );

    component.batchNumber = 2;
    component['availableBattles']();

    expect(component.battles.length).toBe(3);
    expect(component.hasMoreData).toBe(true);
  });

  it('should not load more when hasMoreData is false', () => {
    component.hasMoreData = false;
    const initialBatchNumber = component.batchNumber;

    component.loadMore();

    expect(component.batchNumber).toBe(initialBatchNumber);
    expect(mockUserBattlesService.getUserAvailableBattles).not.toHaveBeenCalled();
  });

  it('should increment batchNumber on loadMore when hasMoreData is true', () => {
    component.hasMoreData = true;
    component.batchNumber = 1;
    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      of({ result: true, data: mockApiResponse }),
    );

    component.loadMore();

    expect(component.batchNumber).toBe(2);
    expect(mockUserBattlesService.getUserAvailableBattles).toHaveBeenCalledWith(2);
  });

  it('should call availableBattles() and reset updateBattleResults$ when not first run and update=true', fakeAsync(() => {
    component['runFirstTime'] = false;

    const availableBattlesSpy = jest
      .spyOn<any, any>(component as any, 'availableBattles')
      .mockImplementation(() => {});

    const nextSpy = jest.spyOn(mockUserBattlesService.updateBattleResults$, 'next');

    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      of({ result: true, data: mockApiResponse }),
    );

    fixture.detectChanges();

    mockUserBattlesService.updateBattleResults$.next(true);
    tick(200);

    expect(availableBattlesSpy).toHaveBeenCalledTimes(2);
    expect(nextSpy).toHaveBeenCalledWith(false);
  }));

  it('should not call availableBattles() again when not first run and update=false', fakeAsync(() => {
    component['runFirstTime'] = false;

    const availableBattlesSpy = jest
      .spyOn<any, any>(component as any, 'availableBattles')
      .mockImplementation(() => {});

    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      of({ result: true, data: mockApiResponse }),
    );

    fixture.detectChanges();

    mockUserBattlesService.updateBattleResults$.next(false);
    tick(200);

    expect(availableBattlesSpy).toHaveBeenCalledTimes(1);
  }));

  it('should enrich battles with difficulty tags', () => {
    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      of({ result: true, data: mockApiResponse }),
    );

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.battles[0].difficultyTag).toBeDefined();
    expect(component.battles[1].difficultyTag).toBeDefined();
  });

  it('should reset battles when batchNumber is 1', () => {
    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      of({ result: true, data: mockApiResponse }),
    );

    component.ngOnInit();
    fixture.detectChanges();

    const firstBatchLength = component.battles.length;

    component.batchNumber = 1;
    component['availableBattles']();

    expect(component.battles.length).toBe(firstBatchLength);
  });
});
