import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UserDashboardComponent } from './user-dashboard.component';
import { UserDashboardService } from '../../../services/user/user-dashboard/user-dashboard.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';

// 🧩 Mock standalone components used in the template
@Component({ selector: 'app-welcome-banner', template: '' })
class MockWelcomeBannerComponent {}

@Component({ selector: 'app-card', template: '' })
class MockCardComponent {}

@Component({ selector: 'app-rank-progress-card', template: '' })
class MockRankProgressCardComponent {}

@Component({ selector: 'app-featured-quiz', template: '' })
class MockFeaturedQuizComponent {}

@Component({ selector: 'app-recent-quiz-result', template: '' })
class MockRecentQuizResultComponent {}

@Component({ selector: 'app-achievement', template: '' })
class MockAchievementComponent {}

@Component({ selector: 'app-battle-request', template: '' })
class MockBattleRequestComponent {}

@Component({ selector: 'app-page-header', template: '' })
class MockPageHeaderComponent {}

// 🧠 Mock services
const mockUserDashboardService = {
  getDashboardData: jest.fn(),
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
        HttpClientTestingModule, // ✅ Fix for HttpClient injector error
        MockWelcomeBannerComponent,
        MockCardComponent,
        MockRankProgressCardComponent,
        MockFeaturedQuizComponent,
        MockRecentQuizResultComponent,
        MockAchievementComponent,
        MockBattleRequestComponent,
        MockPageHeaderComponent,
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

  // ✅ 1. Component creation
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ✅ 2. Should call loadDashboardData on initialization
  it('should call loadDashboardData on ngOnInit', () => {
    const mockData = {
      banner: { userName: 'John', currentRank: 3 },
      card: { quizzesCompleted: 5, totalXp: 200, winRate: 80, currentRank: 3 },
    };

    // ✅ Ensure service method returns observable BEFORE calling ngOnInit
    mockUserDashboardService.getDashboardData.mockReturnValue(of(mockData));

    const loadSpy = jest.spyOn<any, any>(component, 'loadDashboardData');

    component.ngOnInit();

    expect(loadSpy).toHaveBeenCalled();
    expect(mockUserDashboardService.getDashboardData).toHaveBeenCalled();
  });

  // ✅ 3. Should successfully load dashboard data
  it('should load dashboard data successfully', () => {
    const mockData = {
      banner: { userName: 'John', currentRank: 3 },
      card: {
        quizzesCompleted: 5,
        totalXp: 200,
        winRate: 80,
        currentRank: 3,
      },
    };

    mockUserDashboardService.getDashboardData.mockReturnValue(of(mockData));

    component['loadDashboardData']();

    expect(mockUserDashboardService.getDashboardData).toHaveBeenCalledTimes(1);
    expect(component.bannerData).toEqual(mockData.banner);
    expect(component.quizStatsConfigs.length).toBe(Object.keys(mockData.card).length);
  });

  // ✅ 4. Should handle error when fetching dashboard data
  it('should show error message when dashboard data fails to load', () => {
    mockUserDashboardService.getDashboardData.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    component['loadDashboardData']();

    expect(mockUserDashboardService.getDashboardData).toHaveBeenCalled();
    expect(mockSnackbarService.showError).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
    );
  });

  // ✅ 5. Should correctly map summary data to cards
  it('should map summary data to cards correctly', () => {
    const summary = {
      quizzesCompleted: 10,
      totalXp: 1500,
      winRate: 75,
      currentRank: 2,
    };

    const result = component['mapSummaryToCards'](summary);

    expect(result.length).toBe(Object.keys(summary).length);
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('value');
    expect(result[0]).toHaveProperty('icon');
  });

  // ✅ 6. Should complete destroy$ on component destroy
  it('should clean up subscriptions on destroy', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(completeSpy).toHaveBeenCalledTimes(1);
  });
});
