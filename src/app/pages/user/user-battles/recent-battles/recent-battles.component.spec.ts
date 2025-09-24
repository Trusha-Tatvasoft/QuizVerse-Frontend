import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RecentBattlesComponent } from './recent-battles.component';
import { UserBattlesService } from '../../../../services/user/user-battles/user-battles.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { CommonModule } from '@angular/common';
import { TagComponent } from '../../../../shared/components/tag/tag.component';
import { OutlineButtonComponent } from '../../../../shared/components/outline-button/outline-button.component';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { UserRecentBattles, UserRecentBattlesWindow } from '../interface/recent-battles.interface';
import {
  BattleFilterType,
  BattleTimeFilterType,
} from '../../../../shared/enums/user-recent-battle.enum';

describe('RecentBattlesComponent', () => {
  let component: RecentBattlesComponent;
  let fixture: ComponentFixture<RecentBattlesComponent>;
  let mockUserBattlesService: jest.Mocked<UserBattlesService>;
  let mockSnackbarService: jest.Mocked<SnackbarService>;

  const mockBattles: UserRecentBattles[] = [
    {
      battleName: 'Quiz Battle 1',
      opponent: 'John Doe',
      opponentFullName: 'John Doe',
      profilePic: 'https://example.com/john.jpg',
      category: 'General Knowledge',
      result: 'Won',
      yourScore: 10,
      opponentScore: 5,
      xpGained: 100,
      battleDate: new Date('2023-01-01'),
    },
    {
      battleName: 'Quiz Battle 2',
      opponent: 'Jane Smith',
      opponentFullName: 'Jane Smith',
      profilePic: 'https://example.com/jane.jpg',
      category: 'Science',
      result: 'Lost',
      yourScore: 3,
      opponentScore: 8,
      xpGained: 20,
      battleDate: new Date('2023-02-01'),
    },
  ];

  const mockResponse = {
    statusCode: 200,
    result: true,
    data: {
      battles: mockBattles,
      hasMore: true,
    },
    message: 'Data Fetched Successfully',
  };

  const mockLoadMoreResponse = {
    statusCode: 200,
    result: true,
    data: {
      battles: [
        {
          battleName: 'Quiz Battle 3',
          opponent: 'Bob Wilson',
          opponentFullName: 'Bob Wilson',
          category: 'History',
          result: 'Draw',
          yourScore: 7,
          opponentScore: 7,
          xpGained: 50,
          battleDate: new Date('2023-03-01'),
        },
      ],
      hasMore: false,
    },
    message: 'More data fetched',
  };

  beforeEach(async () => {
    mockUserBattlesService = {
      getUserRecentBattles: jest.fn(),
    } as any;

    mockSnackbarService = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TagComponent,
        OutlineButtonComponent,
        MatSelectModule,
        MatFormFieldModule,
        FormsModule,
        RecentBattlesComponent,
      ],
      providers: [
        { provide: UserBattlesService, useValue: mockUserBattlesService },
        { provide: SnackbarService, useValue: mockSnackbarService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentBattlesComponent);
    component = fixture.componentInstance;
    component.recentBattlesList = []; // Reset list
    component.visibleWindow = []; // Reset visible window
    component.windowSize = 8; // Reset to default
    component.currentStart = 0; // Reset to default
    component.listRef = {
      nativeElement: {
        scrollTo: jest.fn(),
        querySelectorAll: jest.fn().mockReturnValue([]),
      },
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getUserRecentBattles', () => {
      const getUserRecentBattlesSpy = jest.spyOn(component, 'getUserRecentBattles');
      mockUserBattlesService.getUserRecentBattles.mockReturnValue(of(mockResponse));

      component.ngOnInit();
      expect(getUserRecentBattlesSpy).toHaveBeenCalled();
    });
  });

  describe('getUserRecentBattles', () => {
    it('should set recentBattlesList, hasMoreData and update visibleWindow on success', () => {
      const updateVisibleWindowSpy = jest.spyOn(component, 'updateVisibleWindow' as any);
      mockUserBattlesService.getUserRecentBattles.mockReturnValue(of(mockResponse));

      component.getUserRecentBattles();

      expect(mockUserBattlesService.getUserRecentBattles).toHaveBeenCalledWith({
        batchNumber: 1,
        filterBy: null,
        timefilterBy: null,
      });
      expect(component.recentBattlesList).toEqual(mockBattles);
      expect(component.hasMoreData).toBe(true);
      expect(updateVisibleWindowSpy).toHaveBeenCalled();
      expect(mockSnackbarService.showError).not.toHaveBeenCalled();
    });

    it('should show error on failed response', () => {
      mockUserBattlesService.getUserRecentBattles.mockReturnValue(
        of({ statusCode: 400, result: false, data: null, message: 'Failed to fetch battles' }),
      );

      component.getUserRecentBattles();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Failed to fetch battles');
      expect(component.recentBattlesList).toEqual([]);
      expect(component.hasMoreData).toBe(false);
    });

    it('should handle error response', () => {
      mockUserBattlesService.getUserRecentBattles.mockReturnValue(
        throwError(() => ({ error: { message: 'Network error' } })),
      );

      component.getUserRecentBattles();

      expect(mockSnackbarService.showError).toHaveBeenCalledWith('Network error');
      expect(component.recentBattlesList).toEqual([]);
      expect(component.hasMoreData).toBe(false);
    });
  });

  describe('subtitle', () => {
    it('should return "Showing All battles of all time" for default filters', () => {
      component.selectedBattleFilter = 0; // Default: All
      component.selectedTimeFilter = 0; // Default: All time
      expect(component.subtitle).toBe('Showing All battles of all time');
    });

    it('should return "Showing Won battles from last 2 days" for won battles and last 2 days', () => {
      component.selectedBattleFilter = BattleFilterType.won;
      component.selectedTimeFilter = BattleTimeFilterType.last_2_Days;
      expect(component.subtitle).toBe('Showing Won battles from last 2 days');
    });

    it('should return "Showing Lost battles from last 7 days" for lost battles and last 7 days', () => {
      component.selectedBattleFilter = BattleFilterType.lost;
      component.selectedTimeFilter = BattleTimeFilterType.last_7_Days;
      expect(component.subtitle).toBe('Showing Lost battles from last 7 days');
    });

    it('should return "Showing Drawn battles from this month" for drawn battles and current month', () => {
      component.selectedBattleFilter = BattleFilterType.draw;
      component.selectedTimeFilter = BattleTimeFilterType.current_month;
      expect(component.subtitle).toBe('Showing Drawn battles from this month');
    });

    it('should return "Showing All battles from last quarter" for all battles and last quarter', () => {
      component.selectedBattleFilter = 0; // Default: All
      component.selectedTimeFilter = BattleTimeFilterType.last_quarter;
      expect(component.subtitle).toBe('Showing All battles from last quarter');
    });

    it('should return "Showing Won battles from this year" for won battles and current year', () => {
      component.selectedBattleFilter = BattleFilterType.won;
      component.selectedTimeFilter = BattleTimeFilterType.current_year;
      expect(component.subtitle).toBe('Showing Won battles from this year');
    });

    it('should return "Showing Lost battles from last year" for lost battles and last year', () => {
      component.selectedBattleFilter = BattleFilterType.lost;
      component.selectedTimeFilter = BattleTimeFilterType.last_year;
      expect(component.subtitle).toBe('Showing Lost battles from last year');
    });

    it('should return "Showing Drawn battles of all time" for drawn battles and all time', () => {
      component.selectedBattleFilter = BattleFilterType.draw;
      component.selectedTimeFilter = 0; // Default: All time
      expect(component.subtitle).toBe('Showing Drawn battles of all time');
    });
  });

  describe('battleFilterChanged', () => {
    it('should reset state and fetch battles with filter', () => {
      const getUserRecentBattlesSpy = jest.spyOn(component, 'getUserRecentBattles');
      mockUserBattlesService.getUserRecentBattles.mockReturnValue(
        of({
          statusCode: 200,
          result: true,
          data: { battles: [], hasMore: false },
          message: 'Success',
        }),
      );

      component.battleFilterChanged(BattleFilterType.won);

      expect(component.selectedBattleFilter).toBe(BattleFilterType.won);
      expect(component.batchNumber).toBe(1);
      expect(component.recentBattlesList).toEqual([]);
      expect(getUserRecentBattlesSpy).toHaveBeenCalled();
    });
  });

  describe('timeFilterChanged', () => {
    it('should reset state and fetch battles with time filter', () => {
      const getUserRecentBattlesSpy = jest.spyOn(component, 'getUserRecentBattles');
      mockUserBattlesService.getUserRecentBattles.mockReturnValue(
        of({
          statusCode: 200,
          result: true,
          data: { battles: [], hasMore: false },
          message: 'Success',
        }),
      );

      component.timeFilterChanged(BattleTimeFilterType.current_month);

      expect(component.selectedTimeFilter).toBe(BattleTimeFilterType.current_month);
      expect(component.batchNumber).toBe(1);
      expect(component.recentBattlesList).toEqual([]);
      expect(getUserRecentBattlesSpy).toHaveBeenCalled();
    });
  });

  describe('loadMore', () => {
    it('should increment batchNumber and fetch more battles if hasMoreData', () => {
      component.hasMoreData = true;
      mockUserBattlesService.getUserRecentBattles.mockReturnValue(of(mockLoadMoreResponse));
      component.recentBattlesList = [...mockBattles];

      component.loadMore();

      expect(component.batchNumber).toBe(2);
      expect(mockUserBattlesService.getUserRecentBattles).toHaveBeenCalledWith({
        batchNumber: 2,
        filterBy: null,
        timefilterBy: null,
      });
    });

    it('should do nothing if no more data', () => {
      component.hasMoreData = false;
      const getUserRecentBattlesSpy = jest.spyOn(component, 'getUserRecentBattles');

      component.loadMore();

      expect(component.batchNumber).toBe(1);
      expect(getUserRecentBattlesSpy).not.toHaveBeenCalled();
    });
  });

  describe('getTagConfigForBattleResult', () => {
    it('should return correct tag config for Won result', () => {
      const battle: UserRecentBattles = { ...mockBattles[0], result: 'Won' };
      const config = component.getTagConfigForBattleResult(battle);
      expect(config).toEqual({
        id: 'Won',
        label: 'Won',
        type: 'static',
        isSelected: false,
        hasBorder: false,
        backgroundColor: 'lightGreen',
        textColor: 'green',
      });
    });

    it('should return correct tag config for Lost result', () => {
      const battle: UserRecentBattles = { ...mockBattles[0], result: 'Lost' };
      const config = component.getTagConfigForBattleResult(battle);
      expect(config).toEqual({
        id: 'Lost',
        label: 'Lost',
        type: 'static',
        isSelected: false,
        hasBorder: false,
        backgroundColor: 'lightRed',
        textColor: 'red',
      });
    });

    it('should return correct tag config for Draw result', () => {
      const battle: UserRecentBattles = { ...mockBattles[0], result: 'Draw' };
      const config = component.getTagConfigForBattleResult(battle);
      expect(config).toEqual({
        id: 'Draw',
        label: 'Draw',
        type: 'static',
        isSelected: false,
        hasBorder: false,
        backgroundColor: 'lightOrange',
        textColor: 'orange',
      });
    });

    it('should return default tag config for unknown result', () => {
      const battle: UserRecentBattles = { ...mockBattles[0], result: 'Unknown' };
      const config = component.getTagConfigForBattleResult(battle);
      expect(config).toEqual({
        id: 'Unknown',
        label: 'Unknown',
        type: 'static',
        isSelected: false,
        hasBorder: false,
        backgroundColor: 'white',
        textColor: 'black',
      });
    });
  });

  describe('getInitials', () => {
    it('should return single initial for single-word name', () => {
      expect(component.getInitials('John')).toBe('J');
    });

    it('should return two initials for two-word name', () => {
      expect(component.getInitials('John Doe')).toBe('JD');
    });

    it('should return empty string for empty name', () => {
      expect(component.getInitials('')).toBe('');
    });
  });

  describe('getInitialsColorClass', () => {
    it('should return color class based on name hash', () => {
      expect(component.getInitialsColorClass('John Doe')).toMatch(/bg-avatar-\d+/);
    });

    it('should return default color for empty name', () => {
      expect(component.getInitialsColorClass('')).toBe('bg-avatar-0');
    });

    it('should return consistent color for same name', () => {
      const color1 = component.getInitialsColorClass('John Doe');
      const color2 = component.getInitialsColorClass('John Doe');
      expect(color1).toBe(color2);
    });
  });

  describe('ngOnChanges', () => {
    it('should update visibleWindow and scroll to top on recentBattlesList change', fakeAsync(() => {
      const updateVisibleWindowSpy = jest.spyOn(component, 'updateVisibleWindow' as any);
      const scrollToTopSpy = jest.spyOn(component, 'scrollToTop' as any);

      const changes = {
        recentBattlesList: {
          currentValue: [...mockBattles], // Use mockBattles to avoid modifying length
        },
      } as any;

      component.ngOnChanges(changes);
      tick(50);

      expect(updateVisibleWindowSpy).toHaveBeenCalled();
      expect(scrollToTopSpy).toHaveBeenCalled();
    }));
  });

  describe('ngOnDestroy', () => {
    it('should clean up destroy$ subject', () => {
      const destroyNextSpy = jest.spyOn(component['destroy$'], 'next');
      const destroyCompleteSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroyNextSpy).toHaveBeenCalled();
      expect(destroyCompleteSpy).toHaveBeenCalled();
    });
  });

  describe('onWheel', () => {
    it('should call moveWindowBy on wheel event with deltaY > 0', () => {
      const moveWindowBySpy = jest.spyOn(component, 'moveWindowBy' as any);
      const event = {
        deltaY: 100,
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;
      component['lastWheelTs'] = 0;

      component.onWheel(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(moveWindowBySpy).toHaveBeenCalledWith(1);
    });

    it('should call moveWindowBy on wheel event with deltaY < 0', () => {
      const moveWindowBySpy = jest.spyOn(component, 'moveWindowBy' as any);
      const event = {
        deltaY: -100,
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;
      component['lastWheelTs'] = 0;

      component.onWheel(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(moveWindowBySpy).toHaveBeenCalledWith(-1);
    });

    it('should not call moveWindowBy if wheel event is too frequent', () => {
      const moveWindowBySpy = jest.spyOn(component, 'moveWindowBy' as any);
      const event = {
        deltaY: 100,
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;
      component['lastWheelTs'] = Date.now();

      component.onWheel(event);

      expect(moveWindowBySpy).not.toHaveBeenCalled();
    });
  });

  describe('onTouchStart and onTouchEnd', () => {
    beforeEach(() => {
      jest
        .spyOn(component, 'getItemElements' as any)
        .mockReturnValue([
          { getBoundingClientRect: () => ({ top: 100 }) },
          { getBoundingClientRect: () => ({ top: 200 }) },
        ]);
      jest.spyOn(component, 'findClosestIndex' as any).mockReturnValue(0);
    });

    it('should handle touch scroll correctly', () => {
      const moveWindowBySpy = jest.spyOn(component, 'moveWindowBy' as any);
      const touchStartEvent = {
        touches: [{ clientY: 150 }],
        preventDefault: jest.fn(),
      } as unknown as TouchEvent;
      const touchEndEvent = {
        changedTouches: [{ clientY: 250 }],
        preventDefault: jest.fn(),
      } as unknown as TouchEvent;

      (component as any).findClosestIndex = jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(1);

      component.onTouchStart(touchStartEvent);
      component.onTouchEnd(touchEndEvent);

      expect(touchStartEvent.preventDefault).toHaveBeenCalled();
      expect(touchEndEvent.preventDefault).toHaveBeenCalled();
      expect(moveWindowBySpy).toHaveBeenCalledWith(-1);
    });

    it('should not move window if touch delta is too small', () => {
      const moveWindowBySpy = jest.spyOn(component, 'moveWindowBy' as any);
      const touchStartEvent = {
        touches: [{ clientY: 150 }],
        preventDefault: jest.fn(),
      } as unknown as TouchEvent;
      const touchEndEvent = {
        changedTouches: [{ clientY: 160 }],
        preventDefault: jest.fn(),
      } as unknown as TouchEvent;

      component.onTouchStart(touchStartEvent);
      component.onTouchEnd(touchEndEvent);

      expect(moveWindowBySpy).not.toHaveBeenCalled();
    });
  });

  describe('updateVisibleWindow', () => {
    beforeEach(() => {
      component.recentBattlesList = [...mockBattles]; // Ensure fresh copy
      component.visibleWindow = [];
      component.currentStart = 0;
      component.windowSize = 1;
    });

    it('should update visibleWindow with correct slice and globalIndex', () => {
      component['updateVisibleWindow']();

      expect(component.visibleWindow).toEqual([
        { ...mockBattles[0], globalIndex: 0 } as UserRecentBattlesWindow,
      ]);
      expect((component.visibleWindow[0] as any).globalIndex).toBe(0);
    });

    it('should adjust currentStart if it exceeds maxStart', () => {
      component.currentStart = 10; // Exceeds maxStart

      component['updateVisibleWindow']();

      expect(component.currentStart).toBe(1); // maxStart = 2 - 1 = 1
      expect(component.visibleWindow).toEqual([
        { ...mockBattles[1], globalIndex: 1 } as UserRecentBattlesWindow,
      ]);
    });
  });

  describe('moveWindowBy', () => {
    beforeEach(() => {
      component.recentBattlesList = [...mockBattles];
      component.windowSize = 1;
      component.currentStart = 0;
    });

    it('should move window forward within bounds', () => {
      const updateVisibleWindowSpy = jest.spyOn(component, 'updateVisibleWindow' as any);
      const scrollToTopSpy = jest.spyOn(component, 'scrollToTop' as any);

      component['moveWindowBy'](1);

      expect(component.currentStart).toBe(1);
      expect(updateVisibleWindowSpy).toHaveBeenCalled();
      expect(scrollToTopSpy).toHaveBeenCalled();
    });

    it('should not move window beyond bounds', () => {
      component.windowSize = 2;
      component.currentStart = 0;

      component['moveWindowBy'](-1);

      expect(component.currentStart).toBe(0);
    });
  });

  describe('scrollToTop', () => {
    it('should call scrollTo on listRef', () => {
      component['scrollToTop']();
      expect(component.listRef.nativeElement.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('should do nothing if listRef is undefined', () => {
      component.listRef = undefined as any;
      expect(() => component['scrollToTop']()).not.toThrow();
    });
  });

  describe('UI rendering', () => {
    beforeEach(() => {
      mockUserBattlesService.getUserRecentBattles.mockReturnValue(
        of({
          statusCode: 200,
          result: true,
          data: { battles: [...mockBattles], hasMore: true },
          message: 'Data Fetched Successfully',
        }),
      );
      component.recentBattlesList = [];
      component.visibleWindow = [];
      component.windowSize = 8;
      component.currentStart = 0;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display header title and dynamic subtitle', () => {
      const title = fixture.debugElement.query(By.css('.recent-battles-title'));
      const subtitle = fixture.debugElement.query(By.css('.recent-battles-subtitle'));

      expect(title.nativeElement.textContent.trim()).toBe('Battle Result History');
      expect(subtitle.nativeElement.textContent.trim()).toBe('Showing All battles of all time');
    });

    it('should display no data message when visibleWindow is empty', () => {
      component.visibleWindow = [];
      fixture.detectChanges();

      const noData = fixture.debugElement.query(By.css('.no-records'));
      expect(noData).toBeTruthy();
      expect(noData.nativeElement.textContent.trim()).toContain('No data available');
    });

    it('should render battle items with opponent, battle name, category, and date', () => {
      component.recentBattlesList = [...mockBattles];
      component.windowSize = 2;
      component.currentStart = 0;
      component['updateVisibleWindow']();
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.recent-battles-item'));
      expect(items.length).toBe(2);

      const firstItem = items[0].query(By.css('.user-details'));
      expect(firstItem.nativeElement.textContent).toContain('vs John Doe');
      expect(firstItem.nativeElement.textContent).toContain(
        'Quiz Battle 1 · General Knowledge · 01 Jan 2023',
      );

      const secondItem = items[1].query(By.css('.user-details'));
      expect(secondItem.nativeElement.textContent).toContain('vs Jane Smith');
      expect(secondItem.nativeElement.textContent).toContain(
        'Quiz Battle 2 · Science · 01 Feb 2023',
      );
    });

    it('should render profile picture when available', () => {
      const img = fixture.debugElement.query(By.css('.profile-pic'));
      expect(img).toBeTruthy();
      expect(img.attributes['src']).toBe('https://example.com/john.jpg');
      expect(img.attributes['alt']).toBe('John Doe');
    });

    it('should render initials when profile picture is not available', () => {
      component.recentBattlesList = [{ ...mockBattles[1], profilePic: undefined }];
      component.windowSize = 1;
      component.currentStart = 0;
      component['updateVisibleWindow']();
      fixture.detectChanges();

      const initials = fixture.debugElement.query(By.css('.profile-fallback'));
      expect(initials).toBeTruthy();
      expect(initials.nativeElement.textContent.trim()).toBe('JS');
    });

    it('should handle profile picture error and show initials', () => {
      const img = fixture.debugElement.query(By.css('.profile-pic'));
      img.triggerEventHandler('error', null);
      fixture.detectChanges();

      const initials = fixture.debugElement.query(By.css('.profile-fallback'));
      expect(initials).toBeTruthy();
    });

    it('should render battle result tag, score, and XP', () => {
      const resultText = fixture.debugElement.query(By.css('.battle-result-text'));
      expect(resultText.nativeElement.textContent).toContain('Won');
      expect(resultText.nativeElement.textContent).toContain('10-5');
      expect(resultText.nativeElement.textContent).toContain('+100');
    });

    it('should render load more button when hasMoreData and at last item', () => {
      component.recentBattlesList = [...mockBattles];
      component.hasMoreData = true;
      component.windowSize = 2;
      component.currentStart = 0;
      component['updateVisibleWindow']();
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.recent-battles-item'));
      expect(items.length).toBe(2);

      const loadMoreButton = fixture.debugElement.query(By.css('app-outline-button'));
      expect(loadMoreButton).toBeTruthy();
    });

    it('should not render load more button when no more data', () => {
      component.recentBattlesList = [...mockBattles];
      component.hasMoreData = false;
      component.windowSize = 2;
      component.currentStart = 0;
      component['updateVisibleWindow']();
      fixture.detectChanges();

      const loadMoreButton = fixture.debugElement.query(By.css('app-outline-button'));
      expect(loadMoreButton).toBeFalsy();
    });

    it('should render mat-select for battle filter', () => {
      const battleSelect = fixture.debugElement.query(By.css('mat-select[ng-reflect-value="0"]'));
      expect(battleSelect).toBeTruthy();
    });

    it('should render mat-select for time filter', () => {
      const timeSelect = fixture.debugElement.queryAll(By.css('mat-select'))[1];
      expect(timeSelect).toBeTruthy();
    });
  });
});
