import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyChampionsComponent } from './monthly-champions.component';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { CommonListDropDown } from '../../../../shared/interfaces/common-dropdown.interface';
import { of, throwError } from 'rxjs';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { MonthlyLeaderEntry } from '../interfaces/user-leaderboard.interface';
import { platformMessages } from '../../../../utils/constants';

describe('MonthlyChampionsComponent', () => {
  let component: MonthlyChampionsComponent;
  let fixture: ComponentFixture<MonthlyChampionsComponent>;
  let leaderboardService: jest.Mocked<LeaderboardService>;
  let snackbar: jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    const leaderboardServiceMock = {
      getAvailableYears: jest.fn(),
      getAvailableMonthsByYear: jest.fn(),
      getMonthlyChampions: jest.fn(),
    } as unknown as jest.Mocked<LeaderboardService>;

    const snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    await TestBed.configureTestingModule({
      imports: [MonthlyChampionsComponent],
      providers: [
        { provide: LeaderboardService, useValue: leaderboardServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyChampionsComponent);
    component = fixture.componentInstance;
    leaderboardService = TestBed.inject(LeaderboardService) as jest.Mocked<LeaderboardService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dropdowns and set selected year and month', () => {
    const years: CommonListDropDown[] = [
      { id: 2024, name: '2024' },
      { id: 2025, name: '2025' },
    ];
    const months: CommonListDropDown[] = [
      { id: 1, name: 'January' },
      { id: 2, name: 'February' },
    ];

    leaderboardService.getAvailableYears.mockReturnValue(
      of({ result: true, data: years, message: '', statusCode: 200 }),
    );
    leaderboardService.getAvailableMonthsByYear.mockReturnValue(
      of({ result: true, data: months, message: '', statusCode: 200 }),
    );
    leaderboardService.getMonthlyChampions.mockReturnValue(
      of({ result: true, data: [], message: '', statusCode: 200 }),
    );

    fixture.detectChanges();

    expect(leaderboardService.getAvailableYears).toHaveBeenCalled();
    expect(leaderboardService.getAvailableMonthsByYear).toHaveBeenCalledWith(2024);
    expect(component.yearList).toEqual(years);
    expect(component.monthList).toEqual(months);
    expect(component.selectedYear).toBe(2024);
  });

  it('should handle empty years list', () => {
    leaderboardService.getAvailableYears.mockReturnValue(
      of({ result: true, data: [], message: '', statusCode: 200 }),
    );

    fixture.detectChanges();

    expect(component.yearList).toEqual([]);
    expect(component.monthList).toEqual([]);
    expect(component.selectedYear).toBeNull();
    expect(component.selectedMonth).toBeNull();
  });

  it('should fetch monthly champions successfully', () => {
    const month = 1;
    const year = 2025;
    const mockResponse: ApiResponse<MonthlyLeaderEntry[]> = {
      result: true,
      message: 'ok',
      data: [
        {
          rank: 1,
          userId: 101,
          userName: 'Alice',
          fullName: 'Alice Smith',
          profilePic: null,
          totalXp: 500,
          averageScore: 95,
          totalQuizzesPlayed: 5,
          totalBattlesPlayed: 3,
          isLoggedInUser: true,
        },
      ],
      statusCode: 200,
    };
    leaderboardService.getMonthlyChampions.mockReturnValue(of(mockResponse));

    component.fetchMonthlyChampions(month, year);

    expect(leaderboardService.getMonthlyChampions).toHaveBeenCalledWith(month, year);
    expect(component.leaderboard).toEqual(mockResponse.data);
  });

  it('should show snackbar on fetch monthly champions error', () => {
    const error = { status: 500, error: { message: 'Server error' } };
    leaderboardService.getMonthlyChampions.mockReturnValue(throwError(() => error));

    component.fetchMonthlyChampions(1, 2025);

    expect(snackbar.showError).toHaveBeenCalledWith('Error!', 'Server error');
  });

  it('should use default error message if err.error.message is missing', () => {
    const error = { status: 404, error: {} };
    leaderboardService.getMonthlyChampions.mockReturnValue(throwError(() => error));

    component.fetchMonthlyChampions(1, 2025);

    expect(snackbar.showError).toHaveBeenCalledWith('Error!', platformMessages.errorMessage);
  });

  it('should update selectedMonthName on filter change and fetch champions', () => {
    component.monthList = [{ id: 1, name: 'January' }];
    component.selectedYear = 2025;
    component.selectedMonth = 1;
    leaderboardService.getMonthlyChampions.mockReturnValue(
      of({ result: true, data: [], message: '', statusCode: 200 }),
    );

    component.onFilterChange();

    expect(component.selectedMonthName).toBe('January');
    expect(leaderboardService.getMonthlyChampions).toHaveBeenCalledWith(1, 2025);
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

  it('should clean up destroy$ on ngOnDestroy', () => {
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
