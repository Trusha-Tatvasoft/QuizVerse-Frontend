import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvailableBattlesComponent } from './available-battles.component';
import { UserBattlesService } from '../../../../services/user/user-battles/user-battles.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { of, throwError } from 'rxjs';
import { AvailableBattle } from '../interface/quiz-battles.interface';
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

  const mockBattles = [
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
    },
  ];

  beforeEach(async () => {
    mockUserBattlesService = {
      getUserAvailableBattles: jest.fn(),
    };
    mockRouter = { navigate: jest.fn() };
    mockSnackbarService = { showError: jest.fn() };

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
      of({ result: true, data: mockBattles }),
    );

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.battles.length).toBe(2);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  });

  it('should handle API error response', () => {
    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      of({ result: false, message: 'Failed to fetch' }),
    );

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.battles.length).toBe(0);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('Failed to fetch');
  });

  it('should show snackbar on observable error', () => {
    mockUserBattlesService.getUserAvailableBattles.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    component.ngOnInit();
    fixture.detectChanges();

    expect(mockSnackbarService.showError).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
    );
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
      ['user', 'battles', 'battle-list', 'quiz-result', encodedId],
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

    const spyService = jest
      .spyOn(mockUserBattlesService, 'getUserAvailableBattles')
      .mockReturnValue(
        of({
          result: true,
          data: [],
          message: 'Success',
        }),
      );

    dialogMock.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.openChallengeFriendDialgue(battle);

    expect(spyService).toHaveBeenCalled();
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

    const spyService = jest.spyOn(mockUserBattlesService, 'getUserAvailableBattles');

    dialogMock.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.openChallengeFriendDialgue(battle);

    expect(spyService).not.toHaveBeenCalled();
  });

  it('should call ngOnDestroy and complete destroy$', () => {
    const spyNext = jest.spyOn(component['destroy$'], 'next');
    const spyComplete = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(spyNext).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });
});
