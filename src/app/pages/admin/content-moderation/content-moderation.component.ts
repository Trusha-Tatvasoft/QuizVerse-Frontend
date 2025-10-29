import { Component, OnInit } from '@angular/core';
import {
  contentModerationHeaderConfig,
  defaultContentModerationTabs,
} from './configs/content-moderation.config';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { TabComponent } from '../../../shared/components/tab/tab.component';
import { LazyTab } from '../../../shared/interfaces/tab-component.interface';

@Component({
  selector: 'app-content-moderation',
  imports: [PageHeaderComponent, CardComponent, TabComponent],
  templateUrl: './content-moderation.component.html',
  styleUrl: './content-moderation.component.scss',
})
export class ContentModerationComponent implements OnInit {
  // Header and configs
  contentModerationConfig = contentModerationHeaderConfig;
  contentModerationStatsConfigs: CardInputConfig[] = [];
  selectedTab = 0;
  tabs: LazyTab[] = defaultContentModerationTabs;

  ngOnInit(): void {
    this.getContentModerationStats();
  }

  onTabChanged(index: number) {
    this.selectedTab = index;
  }

  private getContentModerationStats(): void {
    this.contentModerationStatsConfigs = [
      {
        title: 'Pending Reports',
        value: 23,
        subtitle: 'Requires attention',
        icon: 'flag',
        subtitleColor: 'red',
        valueColor: 'red',
        iconColor: 'red',
      },
      {
        title: 'Under Review',
        value: 8,
        subtitle: 'Being processed',
        icon: 'visibility',
        subtitleColor: 'blue',
        valueColor: 'blue',
        iconColor: 'blue',
      },
      {
        title: 'Resolved Today',
        value: 15,
        subtitle: 'Actions taken',
        icon: 'check_circle',
        subtitleColor: 'green',
        valueColor: 'green',
        iconColor: 'green',
      },
      {
        title: 'Banned Users',
        value: 42,
        subtitle: 'This month',
        icon: 'block',
        subtitleColor: 'purple',
        valueColor: 'purple',
        iconColor: 'purple',
      },
    ];
  }
}
