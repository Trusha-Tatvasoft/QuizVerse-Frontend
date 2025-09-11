import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryLeadersComponent } from './category-leaders.component';
import { LeaderboardService } from '../../../../services/user/leaderboard/leaderboard.service';
import { SnackbarService } from '../../../../shared/service/snackbar/snackbar.service';
import { DropdownService } from '../../../../shared/service/dropdown/dropdown.service';
import { CommonListDropDown } from '../../../../shared/interfaces/common-dropdown.interface';
import { of, throwError } from 'rxjs';
import { DropDownType } from '../../../../shared/enums/dropdown-types.enum';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { CategoryLeaderEntry } from '../interfaces/user-leaderboard.interface';
import { platformMessages } from '../../../../utils/constants';

describe('CategoryLeadersComponent', () => {
  let component: CategoryLeadersComponent;
  let fixture: ComponentFixture<CategoryLeadersComponent>;
  let leaderboardService: jest.Mocked<LeaderboardService>;
  let snackbar: jest.Mocked<SnackbarService>;
  let dropdownService: jest.Mocked<DropdownService>;

  beforeEach(async () => {
    const leaderboardServiceMock = {
      getCategoryLeaderboard: jest.fn(),
    } as unknown as jest.Mocked<LeaderboardService>;

    const snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    const dropdownServiceMock = {
      getDropdownData: jest.fn(),
    } as unknown as jest.Mocked<DropdownService>;

    await TestBed.configureTestingModule({
      imports: [CategoryLeadersComponent],
      providers: [
        { provide: LeaderboardService, useValue: leaderboardServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: DropdownService, useValue: dropdownServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryLeadersComponent);
    component = fixture.componentInstance;
    leaderboardService = TestBed.inject(LeaderboardService) as jest.Mocked<LeaderboardService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    dropdownService = TestBed.inject(DropdownService) as jest.Mocked<DropdownService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dropdowns and set selected category on init', () => {
    const categories: CommonListDropDown[] = [
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ];
    dropdownService.getDropdownData.mockReturnValue(of(categories));
    leaderboardService.getCategoryLeaderboard.mockReturnValue(
      of({
        result: true,
        data: [],
        message: 'ok',
        statusCode: 200,
      }),
    );

    fixture.detectChanges(); // triggers ngOnInit

    expect(dropdownService.getDropdownData).toHaveBeenCalledWith(DropDownType.QuizCategory);
    expect(component.categoryList).toEqual(categories);
    expect(component.selectedCategory).toBe(1);
    expect(component.selectedCategoryName).toBe('Science');
    expect(leaderboardService.getCategoryLeaderboard).toHaveBeenCalledWith(1);
  });

  it('should fetch category leaderboard successfully', () => {
    const mockResponse: ApiResponse<CategoryLeaderEntry[]> = {
      result: true,
      message: 'ok',
      data: [
        {
          rank: 1,
          userId: 101,
          userName: 'Alice',
          fullName: 'Alice Smith',
          profilePic: null,
          averageScore: 90,
          totalQuizzesPlayed: 5,
          totalBattlesPlayed: 3,
          isLoggedInUser: true,
        },
      ],
      statusCode: 200,
    };
    leaderboardService.getCategoryLeaderboard.mockReturnValue(of(mockResponse));

    component.fetchCategoryLeaderboard(1);

    expect(leaderboardService.getCategoryLeaderboard).toHaveBeenCalledWith(1);
    expect(component.leaderboard).toEqual(mockResponse.data);
  });

  it('should call snackbar on fetch leaderboard error', () => {
    const errorResponse = { statusCode: 500, error: { message: 'Server error' } };
    leaderboardService.getCategoryLeaderboard.mockReturnValue(throwError(() => errorResponse));

    component.fetchCategoryLeaderboard(1);

    expect(snackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle} 500`,
      'Server error',
    );
  });

  it('should use default error message when err.error.message is missing', () => {
    const errorResponse = { statusCode: 404, error: {} };
    leaderboardService.getCategoryLeaderboard.mockReturnValue(throwError(() => errorResponse));

    component.fetchCategoryLeaderboard(1);

    expect(snackbar.showError).toHaveBeenCalledWith(
      `${platformMessages.errorTitle} 404`,
      platformMessages.errorMessage,
    );
  });

  it('should update selected category name on filter change', () => {
    component.categoryList = [
      { id: 1, name: 'Science' },
      { id: 2, name: 'Math' },
    ];
    leaderboardService.getCategoryLeaderboard.mockReturnValue(
      of({ result: true, data: [], message: '', statusCode: 200 }),
    );

    component.selectedCategory = 2;
    component.onFilterChange();

    expect(component.selectedCategoryName).toBe('Math');
    expect(leaderboardService.getCategoryLeaderboard).toHaveBeenCalledWith(2);
  });

  it('should handle unknown category on filter change', () => {
    component.categoryList = [];
    leaderboardService.getCategoryLeaderboard.mockReturnValue(
      of({ result: true, data: [], message: '', statusCode: 200 }),
    );

    component.selectedCategory = 99;
    component.onFilterChange();

    expect(component.selectedCategoryName).toBe('Unknown');
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
