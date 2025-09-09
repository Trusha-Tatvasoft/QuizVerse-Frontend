import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BattlesLeaderboardComponent } from './battles-leaderboard.component';
import { UserBattlesService } from '../../../../services/user/user-battles/user-battles.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { platformMessages } from '../../../../utils/constants';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { UserBattleLeaderboardData } from '../interface/user-battles.interface';

describe('BattlesLeaderboardComponent', () => {
  let component: BattlesLeaderboardComponent;
  let fixture: ComponentFixture<BattlesLeaderboardComponent>;
  let userBattlesService: jest.Mocked<UserBattlesService>;
  let snackbar: jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    const userBattlesServiceMock = {
      getBattleLeaderboardList: jest.fn(),
    } as unknown as jest.Mocked<UserBattlesService>;

    const snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    await TestBed.configureTestingModule({
      imports: [BattlesLeaderboardComponent],
      providers: [
        { provide: UserBattlesService, useValue: userBattlesServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattlesLeaderboardComponent);
    component = fixture.componentInstance;
    userBattlesService = TestBed.inject(UserBattlesService) as jest.Mocked<UserBattlesService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch leaderboard on init (success case)', () => {
    const mockResponse: ApiResponse<UserBattleLeaderboardData[]> = {
      result: true,
      message: 'ok',
      data: [
        { userName: 'testUser', totalWins: 2, winPercentage: 50, totalXp: 100, rank: 1 },
      ] as UserBattleLeaderboardData[],
      statusCode: 200,
    };

    userBattlesService.getBattleLeaderboardList.mockReturnValue(of(mockResponse));

    fixture.detectChanges(); // triggers ngOnInit

    expect(userBattlesService.getBattleLeaderboardList).toHaveBeenCalled();
    expect(component.leaderboard.length).toBe(1);
    expect(component.leaderboard[0].userName).toBe('testUser');
  });

  it('should call snackbar on error', () => {
    const errorResponse = {
      statusCode: 500,
      error: { message: 'Server error' },
    };

    userBattlesService.getBattleLeaderboardList.mockReturnValue(throwError(() => errorResponse));

    fixture.detectChanges(); // triggers ngOnInit

    expect(snackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle} 500`,
      'Server error',
    );
  });

  it('should clean up destroy$ on ngOnDestroy', () => {
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should use default error message when err.error.message is missing', () => {
    const errorResponse = {
      statusCode: 404,
      error: {},
    };

    userBattlesService.getBattleLeaderboardList.mockReturnValue(throwError(() => errorResponse));

    fixture.detectChanges();

    expect(snackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle} 404`,
      platformMessages.errorMessage,
    );
  });
});
