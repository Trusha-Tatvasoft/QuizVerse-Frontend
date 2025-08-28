import { Component } from '@angular/core';
import { GlobalLeaderboardCardComponent } from './global-leaderboard-card/global-leaderboard-card.component';
import { TabComponent } from '../../../shared/components/tab/tab.component';
import { defaultUserLeaderboardTabs } from './configs/user-leaderboard.configs';
import { LeaderboardTab } from './interfaces/user-leaderboard.interface';

@Component({
  selector: 'app-user-leaderboard',
  imports: [GlobalLeaderboardCardComponent, TabComponent],
  templateUrl: './user-leaderboard.component.html',
  styleUrl: './user-leaderboard.component.scss',
})
export class UserLeaderboardComponent {
  selectedIndex = 0;
  tabs: LeaderboardTab[] = defaultUserLeaderboardTabs;

  /**
   * Handles tab selection changes.
   * - Updates `selectedIndex` to reflect the newly selected tab.
   */
  onTabChanged(index: number) {
    this.selectedIndex = index;
  }
}
