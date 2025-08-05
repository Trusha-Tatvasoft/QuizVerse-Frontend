import { Component, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { InsightCardComponent } from '../insight-card/insight-card.component';

import { CardInputConfig } from '../../../../shared/interfaces/card-component.interface';
import { CardColor } from '../../../../utils/types/card-component.type';
import { AdminDashboardDataService } from '../../../../services/admin/admin-dashboard/admin-dashboard-data.service';
import { AdminDashboardData } from '../interfaces/admin-dashboard.interface';
import {
  ADMIN_DASHBOARD_HEADER_CONFIG,
  DASHBOARD_STATS_CARD_CONFIG,
  INSIGHT_CARDS_CONFIG,
} from '../configs/admin-dashboard.component.configs';

@Component({
  selector: 'app-admin-dashboard',
  imports: [PageHeaderComponent, CardComponent, MatIconModule, InsightCardComponent, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  adminDashboardConfig = ADMIN_DASHBOARD_HEADER_CONFIG;
  insightCards = INSIGHT_CARDS_CONFIG;
  valueColor: CardColor = 'black';

  private readonly dashboardService = inject(AdminDashboardDataService);
  dashboardStatsConfigs: CardInputConfig[] = [];

  ngOnInit(): void {
    this.dashboardService.getAdminDashboardStats().subscribe((res) => {
      if (res.result && res.data) {
        this.dashboardStatsConfigs = this.mapDashboardStatsToCards(res.data);
      }
    });
  }

  private mapDashboardStatsToCards(data: AdminDashboardData): CardInputConfig[] {
    const adminDashboardCards: CardInputConfig[] = [];

    for (const key in data) {
      const stat = data[key as keyof AdminDashboardData];
      const config = DASHBOARD_STATS_CARD_CONFIG[key as keyof AdminDashboardData];

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
