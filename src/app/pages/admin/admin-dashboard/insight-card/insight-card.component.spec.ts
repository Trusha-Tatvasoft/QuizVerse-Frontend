import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { ChartDataPoint } from '../interfaces/chart-data-point.interface';
import { InsightCardComponent } from './insight-card.component';
import { AdminDashboardDataService } from '../../../../services/admin/admin-dashboard/admin-dashboard-data.service';
import { dateFilterType, filterOptions } from '../../../../utils/constants';

describe('InsightCardComponent', () => {
  let component: InsightCardComponent;
  let fixture: ComponentFixture<InsightCardComponent>;
  let mockDashboardService: Partial<AdminDashboardDataService>;

  const mockEngagementData = {
    result: true,
    data: [
      { label: '2025-07-01', value: 20 },
      { label: '2025-07-02', value: 30 },
    ],
  };
  const mockPerformanceData = {
    result: true,
    data: [
      { label: '2025-07-01', value: 70 },
      { label: '2025-07-02', value: 90 },
    ],
  };
  const mockRevenueData = {
    result: true,
    data: [
      { label: '2025-07-01', value: 500 },
      { label: '2025-07-02', value: 800 },
    ],
  };

  beforeEach(async () => {
    mockDashboardService = {
      getUserEngagementData: jest.fn().mockReturnValue(of(mockEngagementData)),
      getPerformaceScoreData: jest.fn().mockReturnValue(of(mockPerformanceData)),
      getRevenueTrendData: jest.fn().mockReturnValue(of(mockRevenueData)),
    };

    await TestBed.configureTestingModule({
      imports: [InsightCardComponent],
      providers: [{ provide: AdminDashboardDataService, useValue: mockDashboardService }],
    }).compileComponents();

    fixture = TestBed.createComponent(InsightCardComponent);
    component = fixture.componentInstance;
  });

  // Basic creation test
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Default values
  it('should initialize with default values', () => {
    component.ngOnInit();
    expect(component.selectedFilter).toBe(dateFilterType.last7Days);
    expect(component.chartData).toBeNull();
    expect(component.filterOptions).toEqual(filterOptions);
  });

  // Chart loading logic
  it('should load engagement chart data and config', fakeAsync(() => {
    component.card = {
      type: 'engagement',
      title: 'User Engagement',
      icon: 'trending_up',
      subtitle: 'trending_up',
    };
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    expect(mockDashboardService.getUserEngagementData).toHaveBeenCalled();
    expect(component.chartType).toBe('line');
    expect(component.chartData?.datasets[0].label).toBe('Engagement');
  }));

  it('should load performance chart data and config', fakeAsync(() => {
    component.card = {
      type: 'performance',
      title: 'Performance Score',
      icon: 'score',
      subtitle: 'performance',
    };
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    expect(mockDashboardService.getPerformaceScoreData).toHaveBeenCalled();
    expect(component.chartType).toBe('bar');
    expect(component.chartData?.datasets[0].label).toBe('Performance');
  }));

  it('should load revenue chart data and config', fakeAsync(() => {
    component.card = {
      type: 'revenue',
      title: 'Revenue Trend',
      icon: 'payments',
      subtitle: 'revanue',
    };
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    expect(mockDashboardService.getRevenueTrendData).toHaveBeenCalled();
    expect(component.chartType).toBe('doughnut');
    expect(component.chartData?.datasets[0].label).toBe('Revenue');
  }));

  it('should change filter and reload data', fakeAsync(() => {
    component.card = {
      type: 'engagement',
      title: 'Engagement',
      icon: 'trending_up',
      subtitle: 'trending_up',
    };
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    component.onFilterChange(dateFilterType.last30days);
    tick();
    expect(component.selectedFilter).toBe(dateFilterType.last30days);
    expect(mockDashboardService.getUserEngagementData).toHaveBeenCalledTimes(3);
  }));

  // Date utility tests
  it('should return ISO date string', () => {
    const result = (component as any).toIsoDateString(new Date('2025-08-01'));
    expect(result).toBe('2025-08-01');
  });

  it('should return correct display date for lastYear', () => {
    const result = (component as any).toDisplayDate('2024-05-10', dateFilterType.lastYear);
    expect(result).toBe('May-2024');
  });

  it('should return correct display date for allTime', () => {
    const result = (component as any).toDisplayDate('2024-03-15', dateFilterType.allTime);
    expect(result).toBe('2024');
  });

  it('should return correct display date for last7days', () => {
    const result = (component as any).toDisplayDate('2024-05-10', dateFilterType.last7Days);
    expect(result).toBe('10-05-2024');
  });

  it('should convert month number to short name', () => {
    expect((component as any).getMonthShortName(4)).toBe('Apr');
  });

  it('should build correct chartData', () => {
    const mockData: ChartDataPoint[] = [
      { label: '2025-07-01', value: 100 },
      { label: '2025-07-02', value: 200 },
    ];
    component.selectedFilter = 'last30days';
    const chart = (component as any).buildChartData(mockData, 'Revenue');
    expect(chart.labels).toEqual(['01-07-2025', '02-07-2025']);
    expect(chart.datasets[0].data).toEqual([100, 200]);
  });

  //  Filter range tests
  it('should return correct filter dates for last7days', () => {
    const today = new Date();
    const expectedStart = new Date();
    expectedStart.setDate(today.getDate() - 6);
    const result = (component as any).getFilterDates('last7days');
    expect(result.startDate).toBe((component as any).toIsoDateString(expectedStart));
    expect(result.endDate).toBe((component as any).toIsoDateString(today));
  });

  it('should return correct filter dates for last30days', () => {
    const today = new Date();
    const expectedStart = new Date();
    expectedStart.setDate(today.getDate() - 29);
    const result = (component as any).getFilterDates('last30days');
    expect(result.startDate).toBe((component as any).toIsoDateString(expectedStart));
    expect(result.endDate).toBe((component as any).toIsoDateString(today));
  });

  it('should return correct filter dates for allTime', () => {
    const today = new Date();
    const expectedStart = new Date(2000, 0, 1);
    const result = (component as any).getFilterDates('allTime');
    expect(result.startDate).toBe((component as any).toIsoDateString(expectedStart));
    expect(result.endDate).toBe((component as any).toIsoDateString(today));
  });

  // New tests for 'lastMonth'

  it('should return correct filter dates for lastYear', () => {
    // The component implementation modifies the today variable, so we need to replicate that logic
    const today = new Date();
    const currentYear = today.getFullYear();
    const expectedStartDate = new Date(currentYear - 1, 0, 1);

    // Replicate the component's logic: today.setFullYear(today.getFullYear() - 1, 11, 31);
    const expectedEndDate = new Date();
    expectedEndDate.setFullYear(expectedEndDate.getFullYear() - 1, 11, 31);

    const result = (component as any).getFilterDates('lastYear');

    expect(result.startDate).toBe((component as any).toIsoDateString(expectedStartDate));
    expect(result.endDate).toBe((component as any).toIsoDateString(expectedEndDate));
  });

  it('should return correct filter dates for lastYear', () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const expectedStartDate = new Date(currentYear - 1, 0, 1);
    const expectedEndDate = new Date();
    expectedEndDate.setFullYear(expectedEndDate.getFullYear() - 1, 11, 31);
    const result = (component as any).getFilterDates('lastYear');
    expect(result.startDate).toBe((component as any).toIsoDateString(expectedStartDate));
    expect(result.endDate).toBe((component as any).toIsoDateString(expectedEndDate));
  });

  it('should handle API response with no data', fakeAsync(() => {
    (mockDashboardService.getUserEngagementData as jest.Mock).mockReturnValue(
      of({ result: true, data: null }),
    );
    component.card = {
      type: 'engagement',
      title: 'User Engagement',
      icon: 'trending_up',
      subtitle: 'trading_up',
    };
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    expect(component.chartData).toBeNull();
  }));

  it('should handle API response with result false', fakeAsync(() => {
    (mockDashboardService.getUserEngagementData as jest.Mock).mockReturnValue(
      of({ result: false, data: mockEngagementData.data }),
    );
    component.card = {
      type: 'engagement',
      title: 'User Engagement',
      icon: 'trending_up',
      subtitle: 'trending_up',
    };
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    expect(component.chartData).toBeNull();
  }));

  it('should clean up destroy$ subject on destroy', () => {
    const destroySpy = jest.spyOn((component as any).destroy, 'next');
    const completeSpy = jest.spyOn((component as any).destroy, 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalledTimes(1);
    expect(completeSpy).toHaveBeenCalledTimes(1);
  });
});
