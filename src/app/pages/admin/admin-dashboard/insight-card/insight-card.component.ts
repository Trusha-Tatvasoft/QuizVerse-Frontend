import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ChartConfiguration, ChartDataset, ChartType } from 'chart.js';

import { InsightCards } from '../interfaces/insight-card.interface';
import { ChartDataPoint } from '../interfaces/chart-data-point.interface';
import { DynamicChartComponent } from '../dynamic-chart/dynamic-chart.component';
import { AdminDashboardDataService } from '../../../../services/admin/admin-dashboard/admin-dashboard-data.service';
import {
  barChartOptionsConfig,
  doughnutChartOptionsConfig,
  lineChartOptionsConfig,
} from '../configs/chart-options.config';
import { dateFilterType, filterOptions, months } from '../../../../utils/constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-insight-card',
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    DynamicChartComponent,
  ],
  templateUrl: './insight-card.component.html',
  styleUrl: './insight-card.component.scss',
})
export class InsightCardComponent implements OnInit, OnDestroy {
  @Input() card!: InsightCards;

  selectedFilter: string;
  filterOptions = filterOptions;
  months = months;

  chartData: { labels: string[]; datasets: ChartDataset[] } | null = null;
  chartType!: ChartType;
  chartOptions!: ChartConfiguration['options'];
  private readonly destroy = new Subject<void>();
  private readonly dashboardService = inject(AdminDashboardDataService);

  ngOnInit(): void {
    this.selectedFilter = dateFilterType.last7Days;
    this.loadChartData();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.loadChartData();
  }

  private loadChartData(): void {
    if (!this.card?.type) return;

    const { startDate, endDate } = this.getFilterDates(this.selectedFilter);

    switch (this.card.type) {
      case 'engagement':
        this.dashboardService
          .getUserEngagementData({ start_date: startDate, end_date: endDate })
          .pipe(takeUntil(this.destroy))
          .subscribe((res) => {
            if (!res?.result || !res?.data) return;
            this.chartData = this.buildChartData(res.data, 'Engagement');
          });
        this.chartType = 'line';
        this.chartOptions = lineChartOptionsConfig;
        break;

      case 'performance':
        this.dashboardService
          .getPerformaceScoreData({ start_date: startDate, end_date: endDate })
          .pipe(takeUntil(this.destroy))
          .subscribe((res) => {
            if (!res?.result || !res?.data) return;
            this.chartData = this.buildChartData(res.data, 'Performance');
          });
        this.chartType = 'bar';
        this.chartOptions = barChartOptionsConfig;
        break;

      case 'revenue':
        this.dashboardService
          .getRevenueTrendData({ start_date: startDate, end_date: endDate })
          .pipe(takeUntil(this.destroy))
          .subscribe((res) => {
            if (!res?.result || !res?.data) return;
            this.chartData = this.buildChartData(res.data, 'Revenue');
          });
        this.chartType = 'doughnut';
        this.chartOptions = doughnutChartOptionsConfig;
        break;
    }
  }

  private buildChartData(data: ChartDataPoint[], label: string) {
    const labels = data.map((d) => this.toDisplayDate(d.label, this.selectedFilter));
    const values = data.map((d) => d.value);

    return {
      labels,
      datasets: [
        {
          label,
          data: values,
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66, 165, 245, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }

  private getFilterDates(filter: string): { startDate: string; endDate: string } {
    const today = new Date();
    let start = new Date(today);

    switch (filter) {
      case dateFilterType.last7Days:
        start.setDate(today.getDate() - 6);
        break;
      case dateFilterType.last30days:
        start.setDate(today.getDate() - 29);
        break;
      case dateFilterType.lastMonth:
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        today.setDate(0);
        break;
      case dateFilterType.lastYear:
        start = new Date(today.getFullYear() - 1, 0, 1);
        today.setFullYear(today.getFullYear() - 1, 11, 31);
        break;
      case dateFilterType.allTime:
        start = new Date(2000, 0, 1);
        break;
    }

    return {
      startDate: this.toIsoDateString(start),
      endDate: this.toIsoDateString(today),
    };
  }

  //for yyyy-mm-dd format
  private toIsoDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private toDisplayDate(dateStr: string, filter: string): string {
    const [year, month, day] = dateStr.split('-');

    switch (filter) {
      case 'allTime':
        return year;
      case 'lastYear':
        return `${this.getMonthShortName(+month)}-${year}`;
      default:
        return `${day}-${month}-${year}`;
    }
  }

  private getMonthShortName(month: number): string {
    return months[month - 1];
  }
}
