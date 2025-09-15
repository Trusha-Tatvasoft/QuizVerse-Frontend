import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { GlobalRankingsComponent } from './global-rankings.component';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { ElementRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment.dev';
import { platformMessages } from '../../../../utils/constants';
import { LeaderboardEntry } from '../interfaces/user-leaderboard.interface';

describe('GlobalRankingsComponent', () => {
  let component: GlobalRankingsComponent;
  let fixture: ComponentFixture<GlobalRankingsComponent>;
  let leaderboardService: jest.Mocked<LeaderboardService>;
  let snackbar: jest.Mocked<SnackbarService>;

  const mockLeaderboard: LeaderboardEntry[] = [
    {
      rank: 42,
      userId: 1,
      userName: 'john_doe',
      fullName: 'John Doe',
      profilePic: 'john.png',
      totalXp: 2450,
      currentLevel: 12,
      currentStreak: 5,
      newGlobalRank: 40,
      trend: 1,
      is_loggedin_user: true,
    },
    {
      rank: 50,
      userId: 2,
      userName: 'jane_doe',
      fullName: 'Jane Doe',
      profilePic: 'jane.png',
      totalXp: 1800,
      currentLevel: 9,
      currentStreak: 2,
      newGlobalRank: 51,
      trend: -1,
      is_loggedin_user: false,
    },
    {
      rank: 75,
      userId: 3,
      userName: 'bob_smith',
      fullName: 'Bob Smith',
      profilePic: null,
      totalXp: 1200,
      currentLevel: 7,
      currentStreak: 0,
      newGlobalRank: 74,
      trend: 1,
      is_loggedin_user: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalRankingsComponent],
      providers: [
        {
          provide: LeaderboardService,
          useValue: { getGlobalLeaderboard: jest.fn() },
        },
        {
          provide: SnackbarService,
          useValue: { showError: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalRankingsComponent);
    component = fixture.componentInstance;
    leaderboardService = TestBed.inject(LeaderboardService) as jest.Mocked<LeaderboardService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;

    const div = document.createElement('div');
    div.classList.add('list');
    div.scrollTo = jest.fn();
    component.listRef = new ElementRef(div);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit / fetchLeaderboard', () => {
    it('should fetch leaderboard and map profile pics', fakeAsync(() => {
      leaderboardService.getGlobalLeaderboard.mockReturnValue(
        of({
          result: true,
          statusCode: 200,
          message: 'OK',
          data: mockLeaderboard,
        }),
      );

      component.ngOnInit();
      tick(60);

      expect(component.loading).toBe(false);
      expect(component.leaderboard.length).toBe(3);
      expect(component.leaderboard[0].profilePic).toBe(`${environment.imageBaseUrl}/john.png`);
      expect((component.listRef.nativeElement.scrollTo as jest.Mock).mock.calls.length).toBe(1);
    }));

    it('should handle null/undefined data from API gracefully', fakeAsync(() => {
      leaderboardService.getGlobalLeaderboard.mockReturnValue(
        of({
          result: true,
          statusCode: 200,
          message: 'OK',
          data: undefined as unknown as LeaderboardEntry[],
        }),
      );

      component.ngOnInit();
      tick(60);

      expect(component.loading).toBe(false);
      expect(component.leaderboard).toEqual([]);
      expect((component.listRef.nativeElement.scrollTo as jest.Mock).mock.calls.length).toBe(1);
    }));

    it('should handle API error and call snackbar', () => {
      leaderboardService.getGlobalLeaderboard.mockReturnValue(
        throwError(() => ({
          error: { message: 'Failed' },
          statusCode: 500,
        })),
      );

      component.ngOnInit();

      expect(component.loading).toBe(false);
      expect(component.leaderboard).toEqual([]);
      expect(snackbar.showError).toHaveBeenCalledWith(`${platformMessages.errorTitle}`, 'Failed');
    });

    it('should not throw if listRef.nativeElement is null', () => {
      component.listRef = { nativeElement: null } as any;
      (component as any).scrollToTop();
    });
  });

  describe('getInitials', () => {
    it('should return first two initials', () => {
      expect(component.getInitials('John Doe')).toBe('JD');
    });

    it('should handle empty string', () => {
      expect(component.getInitials('')).toBe('?');
    });

    it('should return only 2 chars even if multiple words', () => {
      expect(component.getInitials('Anna Maria Smith')).toBe('AM');
    });
  });

  describe('onImageError', () => {
    it('should clear profilePic', () => {
      const entry = { ...mockLeaderboard[0] };
      component.onImageError(entry);
      expect(entry.profilePic).toBe('');
    });
  });

  describe('updateVisibleWindow', () => {
    beforeEach(() => {
      component.leaderboard = [
        { ...mockLeaderboard[0], is_loggedin_user: true },
        { ...mockLeaderboard[1], is_loggedin_user: false },
        { ...mockLeaderboard[2], is_loggedin_user: false },
      ];
      component.windowSize = 2;
    });

    it('should set visibleWindow to slice if user is inside window', () => {
      component.currentStart = 0;
      component['updateVisibleWindow']();
      expect(component.visibleWindow.length).toBe(2);
      expect(component.visibleWindow.some((u) => u.is_loggedin_user)).toBe(true);
    });

    it('should include logged-in user if outside window (above)', () => {
      component.currentStart = 1;
      component['updateVisibleWindow']();
      expect(component.visibleWindow[0].is_loggedin_user).toBe(true);
    });

    it('should include logged-in user if outside window (below)', () => {
      component.currentStart = 0;
      component.leaderboard = [
        { ...mockLeaderboard[1], is_loggedin_user: false },
        { ...mockLeaderboard[2], is_loggedin_user: false },
        { ...mockLeaderboard[0], is_loggedin_user: true },
      ];
      component['updateVisibleWindow']();
      expect(component.visibleWindow[component.visibleWindow.length - 1].is_loggedin_user).toBe(
        true,
      );
    });

    it('should handle empty leaderboard gracefully', () => {
      component.leaderboard = [];
      component['updateVisibleWindow']();
      expect(component.visibleWindow).toEqual([]);
    });
  });

  describe('scrolling', () => {
    beforeEach(() => {
      component.leaderboard = mockLeaderboard;
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle onWheel events', () => {
      const spy = jest.spyOn<any, any>(component as any, 'moveWindowBy');
      const evt = new WheelEvent('wheel', { deltaY: 100 });

      component.onWheel(evt);
      component.onWheel(evt);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call moveWindowBy(-1) when scrolling up', () => {
      const spy = jest.spyOn<any, any>(component as any, 'moveWindowBy');
      const evtUp = new WheelEvent('wheel', { deltaY: -100 });

      component.onWheel(evtUp);

      expect(spy).toHaveBeenCalledWith(-1);
    });

    it('should call moveWindowBy(1) when scrolling down', () => {
      jest.advanceTimersByTime(200);
      const spy = jest.spyOn<any, any>(component as any, 'moveWindowBy');
      const evtDown = new WheelEvent('wheel', { deltaY: 100 });

      component.onWheel(evtDown);

      expect(spy).toHaveBeenCalledWith(1);
    });
  });

  describe('touch events', () => {
    let container: HTMLDivElement;
    let moveWindowSpy: jest.SpyInstance;

    beforeEach(() => {
      container = component.listRef.nativeElement;

      for (let i = 0; i < 3; i++) {
        const el = document.createElement('div');
        el.classList.add('leaderboard-item');
        el.getBoundingClientRect = jest.fn(() => ({
          top: i * 50,
          bottom: i * 50 + 50,
          left: 0,
          right: 100,
          width: 100,
          height: 50,
          x: 0,
          y: i * 50,
          toJSON: () => {},
        }));
        container.appendChild(el);
      }

      component.leaderboard = mockLeaderboard;
      moveWindowSpy = jest
        .spyOn<any, any>(component as any, 'moveWindowBy')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      moveWindowSpy.mockRestore();
      container.innerHTML = '';
    });

    it('should record the closest touch start index', () => {
      const evt = { touches: [{ clientY: 60 }], preventDefault: jest.fn() } as any;
      component.onTouchStart(evt);
      expect(component['touchStartIndex']).toBe(1);
    });

    it('should ignore swipe when movement is less than 30px', () => {
      component.onTouchStart({ touches: [{ clientY: 25 }], preventDefault: jest.fn() } as any);
      component.onTouchEnd({ changedTouches: [{ clientY: 50 }], preventDefault: jest.fn() } as any);
      expect(moveWindowSpy).not.toHaveBeenCalled();
    });

    it('should call moveWindowBy on upward swipe (>30px)', () => {
      component.onTouchStart({ touches: [{ clientY: 100 }], preventDefault: jest.fn() } as any);
      component.onTouchEnd({ changedTouches: [{ clientY: 0 }], preventDefault: jest.fn() } as any);
      expect(moveWindowSpy).toHaveBeenCalledWith(expect.any(Number));
      expect(moveWindowSpy.mock.calls[0][0]).toBeGreaterThan(0);
    });

    it('should call moveWindowBy on downward swipe (>30px)', () => {
      component.onTouchStart({ touches: [{ clientY: 0 }], preventDefault: jest.fn() } as any);
      component.onTouchEnd({
        changedTouches: [{ clientY: 100 }],
        preventDefault: jest.fn(),
      } as any);
      expect(moveWindowSpy).toHaveBeenCalledWith(expect.any(Number));
      expect(moveWindowSpy.mock.calls[0][0]).toBeLessThan(0);
    });

    it('should handle edge case: touch at first element', () => {
      component.onTouchStart({ touches: [{ clientY: 0 }], preventDefault: jest.fn() } as any);
      expect(component['touchStartIndex']).toBe(0);
    });

    it('should handle edge case: touch at last element', () => {
      component.onTouchStart({ touches: [{ clientY: 120 }], preventDefault: jest.fn() } as any);
      expect(component['touchStartIndex']).toBe(2);
    });

    it('should handle empty leaderboard gracefully', () => {
      component.leaderboard = [];
      const dummy = document.createElement('div');
      dummy.classList.add('leaderboard-item');
      dummy.getBoundingClientRect = jest.fn(() => ({
        top: 0,
        bottom: 50,
        left: 0,
        right: 100,
        width: 100,
        height: 50,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));
      component.listRef.nativeElement.appendChild(dummy);

      const moveWindowSpy = jest.spyOn<any, any>(component as any, 'moveWindowBy');

      component.onTouchStart({ touches: [{ clientY: 25 }], preventDefault: jest.fn() } as any);
      component.onTouchEnd({
        changedTouches: [{ clientY: -50 }],
        preventDefault: jest.fn(),
      } as any);

      expect(moveWindowSpy).toHaveBeenCalledWith(0);
    });

    it('should calculate moveBy correctly for swipe', () => {
      component.onTouchStart({ touches: [{ clientY: 10 }], preventDefault: jest.fn() } as any);
      component.onTouchEnd({
        changedTouches: [{ clientY: 110 }],
        preventDefault: jest.fn(),
      } as any);
      const moveBy = component['touchStartIndex'] - 2;
      expect(moveWindowSpy).toHaveBeenCalledWith(moveBy);
    });
  });

  describe('trackByRank', () => {
    it('should return rank', () => {
      expect(component.trackByRank(0, { ...mockLeaderboard[0] })).toBe(mockLeaderboard[0].rank);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$', () => {
      const nextSpy = jest.spyOn<any, any>(component['destroy$'], 'next');
      const completeSpy = jest.spyOn<any, any>(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
