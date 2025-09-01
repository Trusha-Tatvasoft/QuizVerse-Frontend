import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalLeaderboardCardComponent } from './global-leaderboard-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { UserLeaderboardStats } from '../interfaces/user-leaderboard.interface';
import { of, throwError } from 'rxjs';
import { defaultUserLeaderboardStats } from '../configs/user-leaderboard.configs';
import { platformMessages } from '../../../../utils/constants';

describe('GlobalLeaderboardCardComponent', () => {
  let component: GlobalLeaderboardCardComponent;
  let fixture: ComponentFixture<GlobalLeaderboardCardComponent>;
  let leaderboardServiceMock: jest.Mocked<LeaderboardService>;
  let snackbarMock: jest.Mocked<SnackbarService>;

  leaderboardServiceMock = {
    getUserLeaderboardStats: jest.fn(),
    getGlobalLeaderboard: jest.fn(),
  } as unknown as jest.Mocked<LeaderboardService>;

  snackbarMock = {
    showError: jest.fn(),
  } as unknown as jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLeaderboardCardComponent, MatCardModule, MatIconModule],
      providers: [
        { provide: LeaderboardService, useValue: leaderboardServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalLeaderboardCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit & getUserLeaderboardStats', () => {
    it('should fetch and set userLeaderboardStats on success', () => {
      const mockStats: UserLeaderboardStats = {
        globalRank: 5,
        totalXp: 1200,
        currentLevel: 10,
      };

      leaderboardServiceMock.getUserLeaderboardStats.mockReturnValue(
        of({ result: true, data: mockStats, message: 'ok', statusCode: 200 }),
      );

      component.ngOnInit();

      expect(component.userLeaderboardStats).toEqual(mockStats);
      expect(leaderboardServiceMock.getUserLeaderboardStats).toHaveBeenCalled();
    });

    it('should reset stats and call snackbar on error', () => {
      const error = {
        statusCode: 500,
        error: { message: 'Internal server error' },
      };

      leaderboardServiceMock.getUserLeaderboardStats.mockReturnValue(throwError(() => error));

      component.ngOnInit();

      expect(component.userLeaderboardStats).toEqual(defaultUserLeaderboardStats);
      expect(snackbarMock.showError).toHaveBeenCalledWith(
        `${platformMessages.errorTitle} 500`,
        'Internal server error',
      );
    });

    it('should fall back to default error message if none provided', () => {
      const error = { statusCode: 400 };

      leaderboardServiceMock.getUserLeaderboardStats.mockReturnValue(throwError(() => error));

      component.ngOnInit();

      expect(component.userLeaderboardStats).toEqual(defaultUserLeaderboardStats);
      expect(snackbarMock.showError).toHaveBeenCalledWith(
        `${platformMessages.errorTitle} 400`,
        platformMessages.errorMessage,
      );
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
      const nextSpy = jest.spyOn((component as any).destroy$, 'next');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Template rendering', () => {
    it('should render leaderboard stats in template', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const statValues = compiled.querySelectorAll('.stat-value');

      expect(statValues[0].textContent?.trim()).toBe('#0');
      expect(statValues[1].textContent?.trim()).toBe('0');
      expect(statValues[2].textContent?.trim()).toBe('Level 0');
    });
  });
});
