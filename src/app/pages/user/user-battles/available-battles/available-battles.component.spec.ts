import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvailableBattlesComponent } from './available-battles.component';
import { UserBattlesService } from '../../../../services/user/user-battles/user-battles.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { of, throwError } from 'rxjs';
import { AvailableBattle } from '../interface/quiz-battles.interface';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';
describe('AvailableBattlesComponent', () => {
  let component: AvailableBattlesComponent;
  let fixture: ComponentFixture<AvailableBattlesComponent>;
  let mockUserBattlesService: any;
  let mockRouter: any;
  let mockSnackbarService: any;

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

    await TestBed.configureTestingModule({
      imports: [AvailableBattlesComponent],
      providers: [
        { provide: UserBattlesService, useValue: mockUserBattlesService },
        { provide: Router, useValue: mockRouter },
        { provide: SnackbarService, useValue: mockSnackbarService },
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

  it('should navigate to challenge friend', () => {
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

    component.navigateToChallengeFriend(battle);

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

  it('should call ngOnDestroy and complete destroy$', () => {
    const spyNext = jest.spyOn(component['destroy$'], 'next');
    const spyComplete = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(spyNext).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });
});
