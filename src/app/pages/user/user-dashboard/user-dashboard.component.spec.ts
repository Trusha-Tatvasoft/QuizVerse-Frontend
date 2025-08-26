import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserDashboardComponent } from './user-dashboard.component';
import { UserDashboardService } from '../../../services/user/user-dashboard/user-dashboard.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { Component } from '@angular/core';

// Mock Components for Standalone Components
@Component({ selector: 'app-card', template: '' })
class MockCardComponent {
  cardConfig: any;
}

@Component({ selector: 'app-welcome-banner', template: '' })
class MockWelcomeBannerComponent {
  userDetails: any;
}

@Component({ selector: 'app-rank-progress-card', template: '' })
class MockRankProgressCardComponent {
  rankData: any;
}

// Mock Services
const mockUserDashboardService = {
  getDashboardData: jest.fn(),
  getRankProgress: jest.fn(),
};

const mockSnackbarService = {
  showError: jest.fn(),
};

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserDashboardComponent, // Standalone component
        MockCardComponent,
        MockWelcomeBannerComponent,
        MockRankProgressCardComponent,
      ],
      providers: [
        { provide: UserDashboardService, useValue: mockUserDashboardService },
        { provide: SnackbarService, useValue: mockSnackbarService },
      ],
    }).compileComponents();

    component = TestBed.createComponent(UserDashboardComponent).componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadDashboardData and loadRankProgressData on ngOnInit', () => {
    const mockDashboardData = {
      banner: { userName: 'John', currentRank: 3 },
      card: { quizzesCompleted: 5, totalXp: 200, winRate: 80, currentRank: 3 },
    };

    const mockRankData = { currentRank: 3, nextRank: 4, progressPercent: 50, xpNeeded: 100 };

    // Mock service methods
    mockUserDashboardService.getDashboardData.mockReturnValue(of(mockDashboardData));
    mockUserDashboardService.getRankProgress.mockReturnValue(of(mockRankData));

    // Call ngOnInit
    component.ngOnInit();

    expect(mockUserDashboardService.getDashboardData).toHaveBeenCalled();
    expect(mockUserDashboardService.getRankProgress).toHaveBeenCalled();

    expect(component.bannerData).toEqual(mockDashboardData.banner);
    expect(component.rankData).toEqual(mockRankData);
  });

  it('should load dashboard data successfully', () => {
    const mockData = {
      banner: { userName: 'John', currentRank: 3 },
      card: { quizzesCompleted: 5, totalXp: 200, winRate: 80, currentRank: 3 },
    };

    mockUserDashboardService.getDashboardData.mockReturnValue(of(mockData));

    component['loadDashboardData']();

    expect(mockUserDashboardService.getDashboardData).toHaveBeenCalled();
    expect(component.bannerData).toEqual(mockData.banner);
    expect(component.quizStatsConfigs.length).toBe(Object.keys(mockData.card).length);
  });

  it('should handle dashboard data error', () => {
    mockUserDashboardService.getDashboardData.mockReturnValue(throwError(() => new Error('Error')));

    component['loadDashboardData']();

    expect(mockSnackbarService.showError).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
    );
  });

  it('should map summary to cards correctly', () => {
    const summary = { quizzesCompleted: 5, totalXp: 200, winRate: 80, currentRank: 3 };
    const cards = component['mapSummaryToCards'](summary);

    expect(cards.length).toBe(Object.keys(summary).length);
    expect(cards[0]).toHaveProperty('title');
    expect(cards[0]).toHaveProperty('value');
    expect(cards[0]).toHaveProperty('icon');
  });

  it('should load rank progress data successfully', () => {
    const rankData = { currentRank: 3, previousRank: 4, progressPercentage: 50 };
    mockUserDashboardService.getRankProgress.mockReturnValue(of(rankData));

    component['loadRankProgressData']();

    expect(mockUserDashboardService.getRankProgress).toHaveBeenCalled();
    expect(component.rankData).toEqual(rankData);
  });

  it('should handle rank progress error', () => {
    mockUserDashboardService.getRankProgress.mockReturnValue(throwError(() => new Error('Error')));

    component['loadRankProgressData']();

    expect(mockSnackbarService.showError).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
    );
  });
});
