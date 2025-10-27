import { Component } from '@angular/core';
import { GlobalLeaderboardCardComponent } from './global-leaderboard-card/global-leaderboard-card.component';
import { TabComponent } from '../../../shared/components/tab/tab.component';
import {
  defaultUserLeaderboardTabs,
  leaderboardHeaderConfig,
} from './configs/user-leaderboard.configs';
import { LazyTab } from '../../../shared/interfaces/tab-component.interface';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-user-leaderboard',
  imports: [GlobalLeaderboardCardComponent, TabComponent, PageHeaderComponent],
  templateUrl: './user-leaderboard.component.html',
  styleUrl: './user-leaderboard.component.scss',
})
export class UserLeaderboardComponent {
  selectedIndex = 0;
  tabs: LazyTab[] = defaultUserLeaderboardTabs;
  leaderboardHeaderConfig = leaderboardHeaderConfig;

  /**
   * Handles tab selection changes.
   * - Updates `selectedIndex` to reflect the newly selected tab.
   */
  onTabChanged(index: number) {
    this.selectedIndex = index;
  }
}
