import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyLeadersComponent } from './weekly-leaders.component';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { WeeklyLeaderEntry } from '../interfaces/user-leaderboard.interface';
import { of, throwError } from 'rxjs';
import { platformMessages } from '../../../../utils/constants';

describe('WeeklyLeadersComponent', () => {
  let component: WeeklyLeadersComponent;
  let fixture: ComponentFixture<WeeklyLeadersComponent>;
  let leaderboardService: jest.Mocked<LeaderboardService>;
  let snackbar: jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    const leaderboardServiceMock = {
      getWeeklyLeaderboard: jest.fn(),
    } as unknown as jest.Mocked<LeaderboardService>;

    const snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    await TestBed.configureTestingModule({
      imports: [WeeklyLeadersComponent],
      providers: [
        { provide: LeaderboardService, useValue: leaderboardServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WeeklyLeadersComponent);
    component = fixture.componentInstance;
    leaderboardService = TestBed.inject(LeaderboardService) as jest.Mocked<LeaderboardService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch leaderboard on init (success case)', () => {
    const mockResponse: ApiResponse<WeeklyLeaderEntry[]> = {
      result: true,
      message: 'ok',
      data: [
        {
          rank: 1,
          userId: 101,
          userName: 'testUser',
          fullName: 'Test User',
          profilePic: null,
          totalXp: 100,
          totalQuizzesPlayed: 5,
          totalBattlesPlayed: 2,
          isLoggedInUser: false,
        },
      ],
      statusCode: 200,
    };

    leaderboardService.getWeeklyLeaderboard.mockReturnValue(of(mockResponse));

    fixture.detectChanges();

    expect(leaderboardService.getWeeklyLeaderboard).toHaveBeenCalled();
    expect(component.leaderboard.length).toBe(1);
    expect(component.leaderboard[0].userName).toBe('testUser');
  });

  it('should call snackbar on error', () => {
    const errorResponse = {
      statusCode: 500,
      error: { message: 'Server error' },
    };

    leaderboardService.getWeeklyLeaderboard.mockReturnValue(throwError(() => errorResponse));

    fixture.detectChanges();

    expect(snackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle}`,
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

    leaderboardService.getWeeklyLeaderboard.mockReturnValue(throwError(() => errorResponse));

    fixture.detectChanges();

    expect(snackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle}`,
      platformMessages.errorMessage,
    );
  });

  it('should return correct initials', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
    expect(component.getInitials('Alice')).toBe('A');
    expect(component.getInitials('')).toBe('');
  });

  it('should return correct initials color class', () => {
    const className = component.getInitialsColorClass('Alice');
    expect(className).toMatch(/^bg-avatar-\d+$/);
    expect(component.getInitialsColorClass('')).toBe('bg-avatar-0');
  });
});
