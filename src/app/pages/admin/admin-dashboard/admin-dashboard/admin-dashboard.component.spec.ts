import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminDashboardDataService } from '../../../../services/admin/admin-dashboard/admin-dashboard-data.service';
import { of } from 'rxjs';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { InsightCardComponent } from '../insight-card/insight-card.component';
import { AdminDashboardData } from '../interfaces/admin-dashboard.interface';

jest.mock('chart.js');
jest.mock('ng2-charts');

describe('AdminDashboardComponent (Jest)', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let dashboardService: AdminDashboardDataService;

  const mockData: AdminDashboardData = {
    totalUsers: { value: 1000, trendPercentage: 10 },
    activeQuizzes: { value: 120, trendPercentage: -5 },
    revenue: { value: 50000, trendPercentage: 15 },
    reports: { value: 35, trendPercentage: 2 },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PageHeaderComponent,
        CardComponent,
        MatIconModule,
        CommonModule,
        InsightCardComponent,
        AdminDashboardComponent,
      ],
      providers: [
        {
          provide: AdminDashboardDataService,
          useValue: {
            getAdminDashboardStats: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(AdminDashboardDataService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch dashboard stats on init', () => {
    (dashboardService.getAdminDashboardStats as jest.Mock).mockReturnValue(
      of({
        result: true,
        statusCode: 200,
        message: 'Success',
        data: mockData,
      }),
    );

    component.ngOnInit();

    expect(dashboardService.getAdminDashboardStats).toHaveBeenCalled();
  });

  it('should map data to card config correctly', () => {
    const result = component['mapDashboardStatsToCards'](mockData);

    expect(result.length).toBe(4);
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('value');
    expect(result[0]).toHaveProperty('subtitleColor');
  });

  it('should prefix $ for revenue value', () => {
    const result = component['mapDashboardStatsToCards'](mockData);
    const revenueCard = result.find((card) => card.title.toLowerCase().includes('revenue'));
    expect(revenueCard?.value.toString()).toContain('$');
  });

  it('should show correct subtitle color based on trend', () => {
    const result = component['mapDashboardStatsToCards'](mockData);
    const usersCard = result.find((card) => card.title.toLowerCase().includes('user'));
    const quizCard = result.find((card) => card.title.toLowerCase().includes('quiz'));

    expect(usersCard?.subtitleColor).toBe('green');
    expect(quizCard?.subtitleColor).toBe('red');
  });
});
