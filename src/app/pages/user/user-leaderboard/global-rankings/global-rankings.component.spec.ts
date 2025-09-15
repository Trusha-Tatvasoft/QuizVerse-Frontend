import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalRankingsComponent } from './global-rankings.component';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { LeaderboardEntry } from '../interfaces/user-leaderboard.interface';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../../environments/environment.dev';
import { of, throwError } from 'rxjs';
import { platformMessages } from '../../../../utils/constants';

describe('GlobalRankingsComponent', () => {
  let component: GlobalRankingsComponent;
  let fixture: ComponentFixture<GlobalRankingsComponent>;
  let leaderboardService: jest.Mocked<LeaderboardService>;
  let snackbar: jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    const leaderboardServiceMock = {
      getGlobalLeaderboard: jest.fn(),
    } as unknown as jest.Mocked<LeaderboardService>;

    const snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    await TestBed.configureTestingModule({
      imports: [GlobalRankingsComponent],
      providers: [
        { provide: LeaderboardService, useValue: leaderboardServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalRankingsComponent);
    component = fixture.componentInstance;
    leaderboardService = TestBed.inject(LeaderboardService) as jest.Mocked<LeaderboardService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch leaderboard on init (success case)', () => {
    const mockResponse: ApiResponse<LeaderboardEntry[]> = {
      result: true,
      message: 'ok',
      data: [
        {
          rank: 1,
          userId: 10,
          userName: 'alice',
          fullName: 'Alice Johnson',
          profilePic: 'alice.png',
          totalXp: 1200,
          currentLevel: 5,
          currentStreak: 7,
          newGlobalRank: 1,
          trend: 1,
          isLoggedInUser: false,
        },
      ],
      statusCode: 200,
    };

    leaderboardService.getGlobalLeaderboard.mockReturnValue(of(mockResponse));

    fixture.detectChanges();

    expect(leaderboardService.getGlobalLeaderboard).toHaveBeenCalled();
    expect(component.leaderboard.length).toBe(1);
    expect(component.leaderboard[0].profilePic).toBe(`${environment.imageBaseUrl}/alice.png`);
  });

  it('should handle missing profilePic gracefully', () => {
    const mockResponse: ApiResponse<LeaderboardEntry[]> = {
      result: true,
      message: 'ok',
      data: [
        {
          rank: 2,
          userId: 11,
          userName: 'bob',
          fullName: 'Bob Smith',
          profilePic: null,
          totalXp: 800,
          currentLevel: 4,
          currentStreak: 3,
          newGlobalRank: 2,
          trend: -1,
          isLoggedInUser: false,
        },
      ],
      statusCode: 200,
    };

    leaderboardService.getGlobalLeaderboard.mockReturnValue(of(mockResponse));

    fixture.detectChanges();

    expect(component.leaderboard[0].profilePic).toBe('');
  });

  it('should call snackbar on error', () => {
    const errorResponse = {
      statusCode: 500,
      error: { message: 'Server error' },
    };

    leaderboardService.getGlobalLeaderboard.mockReturnValue(throwError(() => errorResponse));

    fixture.detectChanges();

    expect(snackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle} 500`,
      'Server error',
    );
    expect(component.leaderboard).toEqual([]);
  });

  it('should use default error message when err.error.message is missing', () => {
    const errorResponse = {
      statusCode: 404,
      error: {},
    };

    leaderboardService.getGlobalLeaderboard.mockReturnValue(throwError(() => errorResponse));

    fixture.detectChanges();

    expect(snackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle} 404`,
      platformMessages.errorMessage,
    );
    expect(component.leaderboard).toEqual([]);
  });

  it('should clean up destroy$ on ngOnDestroy', () => {
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
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
