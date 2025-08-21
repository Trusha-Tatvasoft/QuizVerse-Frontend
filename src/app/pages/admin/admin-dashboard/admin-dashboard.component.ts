import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { CardColor } from '../../../utils/types/card-component.type';
import { AdminDashboardSummary } from './interfaces/admin-dashboard-summary.interface';
import { InsightCardComponent } from './insight-card/insight-card.component';
import { adminDashboardHeaderConfig } from './configs/admin-dashboard-header.configs';
import { insightCardsConfig } from './configs/insight-cards-configs';
import { AdminDashboardDataService } from '../../../services/admin/admin-dashboard/admin-dashboard-data.service';
import { dashboardStatsCardConfig } from './configs/dashboard-stats-card.configs';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  imports: [PageHeaderComponent, CardComponent, MatIconModule, InsightCardComponent, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private readonly destroy = new Subject<void>();

  adminDashboardConfig = adminDashboardHeaderConfig;
  insightCards = insightCardsConfig;
  valueColor: CardColor = 'black';

  private readonly dashboardService = inject(AdminDashboardDataService);
  dashboardStatsConfigs: CardInputConfig[] = [];

  ngOnInit(): void {
    this.dashboardService
      .getAdminDashboardStats()
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        if (res.result && res.data) {
          this.dashboardStatsConfigs = this.mapDashboardStatsToCards(res.data);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  private mapDashboardStatsToCards(data: AdminDashboardSummary): CardInputConfig[] {
    const adminDashboardCards: CardInputConfig[] = [];

    for (const key in data) {
      const stat = data[key as keyof AdminDashboardSummary];
      const config = dashboardStatsCardConfig[key as keyof AdminDashboardSummary];

      const value = key === 'revenue' ? `$${stat.value}` : stat.value;

      const subtitle = `${stat.trendPercentage >= 0 ? '+' : ''}${stat.trendPercentage}% from last month`;
      const subtitleColor = stat.trendPercentage >= 0 ? 'green' : 'red';

      adminDashboardCards.push({
        title: config.title,
        value: value,
        subtitle: subtitle,
        valueColor: this.valueColor,
        subtitleColor: subtitleColor,
        icon: config.icon,
        iconColor: config.iconColor,
      });
    }

    return adminDashboardCards;
  }
}
